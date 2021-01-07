import { CreateBooking, Booking, mapBooking, RestoreBooking } from './model';
import { Config } from '../app-config';
import { createBooking as dbCreate, BookingsModel } from '../db/bookings';
import { parse } from 'date-fns';
import { getAvailableDates, dateStartOfWeek } from '../dates';
import {
  incrementOfficeBookingCount,
  decrementOfficeBookingCount,
  getOfficeBookings,
} from '../db/officeBookings';
import { incrementUserBookingCount, decrementUserBookingCount } from '../db/userBookings';
import { Forbidden, HttpError } from '../errors';
import { User, getUser } from '../users/model';
import { SES } from 'aws-sdk';

const audit = (step: string, details?: any) =>
  console.info(
    JSON.stringify({
      level: 'AUDIT',
      action: 'CreateBooking',
      step,
      details,
    })
  );

const sendNotificationEmail = async (
  emailAddress: string,
  fromAddress: string,
  reasonToBook: string
) => {
  const params: SES.SendEmailRequest = {
    Destination: { ToAddresses: [emailAddress] },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: reasonToBook,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Office Booker - Justification To Book',
      },
    },
    Source: fromAddress,
  };
  const ses = new SES();
  return await ses.sendEmail(params).promise();
};

const checkReasonEnv = (config: Config) => {
  const { fromAddress, notificationToAddress } = config;
  if (fromAddress === undefined || notificationToAddress === undefined) {
    const missingVars = Object.entries({
      fromAddress,
      notificationToAddress,
    })
      .filter(([, val]) => val === undefined)
      .map(([envVar]) => envVar);
    throw Error(`Missing required env parameters for reason notifications: ${missingVars}`);
  }
  return {
    fromAddress,
    notificationToAddress,
  };
};

export const createBooking = async (
  config: Config,
  currentUser: User,
  request: CreateBooking | RestoreBooking
): Promise<Booking> => {
  const isAuthorised =
    request.user === currentUser.email ||
    currentUser.permissions.canManageAllBookings ||
    currentUser.permissions.officesCanManageBookingsFor.find(
      (office) => office.id === request.office.id
    ) !== undefined;

  if (!isAuthorised) {
    throw new Forbidden();
  }

  if (config.reasonToBookRequired) {
    checkReasonEnv(config);
    if (!request.reasonToBook) {
      throw new HttpError({
        httpMessage: `Invalid reason to book given`,
        status: 400,
        internalMessage: `No reason to book provided`,
      });
    }
  }

  const parsed = parse(request.date, 'yyyy-MM-dd', new Date());
  if (Number.isNaN(parsed.getTime())) {
    throw new HttpError({
      internalMessage: `Invalid date format: ${request.date}`,
      status: 400,
      httpMessage: 'Invalid date format',
    });
  }

  if (!getAvailableDates(config).includes(request.date)) {
    throw new HttpError({
      internalMessage: `Date out of range: ${request.date}`,
      status: 400,
      httpMessage: 'Date out of range',
    });
  }

  const requestedOffice = config.officeQuotas.find((office) => office.id === request.office.id);
  if (!requestedOffice) {
    throw new HttpError({
      internalMessage: `Office not found: ${request.office}`,
      status: 400,
      httpMessage: 'Office not found',
    });
  }

  // Id date as a direct string
  const id = requestedOffice.id + '_' + request.date.replace(/-/gi, '');
  const newBooking = <BookingsModel>{
    id,
    parking: request.parking ?? false,
    officeId: requestedOffice.id,
    date: request.date,
    user: request.user,
    ...('created' in request ? { id: request.id, created: request.created } : {}),
  };

  const userEmail = newBooking.user.toLocaleLowerCase();
  const startOfWeek = dateStartOfWeek(newBooking.date);

  const officeBookings = await getOfficeBookings(config, requestedOffice.name, [newBooking.date]);
  const isQuotaExceeded = officeBookings[0]?.bookingCount >= requestedOffice.quota;
  const isParkingExceeded =
    newBooking.parking && officeBookings[0]?.parkingCount >= requestedOffice.parkingQuota;
  if (isQuotaExceeded || isParkingExceeded) {
    const whichExceeded =
      isQuotaExceeded && isParkingExceeded
        ? 'Office and parking quota'
        : isQuotaExceeded
        ? 'Office quota'
        : 'Office parking quota';
    throw new HttpError({
      internalMessage: `${whichExceeded} has exceeded for ${requestedOffice.name} on date: ${newBooking.date}`,
      status: 409,
      httpMessage: `${whichExceeded} exceeded`,
    });
  }

  audit('1:IncrementingOfficeBookingCount', { newBooking, startOfWeek, currentUser });
  const officeBookedSuccessfully = await incrementOfficeBookingCount(
    config,
    requestedOffice,
    newBooking.date,
    newBooking.parking
  );

  if (!officeBookedSuccessfully) {
    const parkingInternalMessageAddition = newBooking.parking
      ? ` or parking quota of ${requestedOffice.parkingQuota}`
      : '';
    const parkingMessageAddition = newBooking.parking ? ` or parking quota` : '';

    throw new HttpError({
      internalMessage: `Office quota of ${requestedOffice.quota}${parkingInternalMessageAddition} has exceeded for ${requestedOffice.name} on date: ${newBooking.date}`,
      status: 409,
      httpMessage: `Office quota${parkingMessageAddition} exceeded`,
    });
  }

  audit('2:IncrementingUserBookingCount');
  const dbUser = await getUser(config, userEmail);
  const userBookedSuccessfully = await incrementUserBookingCount(
    config,
    userEmail,
    dbUser.quota,
    startOfWeek
  );

  if (!userBookedSuccessfully) {
    audit('2.1:DecrementingOfficeBookingCount');
    await decrementOfficeBookingCount(
      config,
      requestedOffice.id,
      newBooking.date,
      newBooking.parking
    );
    throw new HttpError({
      internalMessage: `User quota of ${dbUser.quota} has exceeded for ${userEmail} on date: ${newBooking.date}`,
      status: 409,

      httpMessage: 'User quota exceeded',
    });
  }

  audit('3:CreatingBooking');
  const createdBooking = await dbCreate(config, newBooking);
  if (createdBooking === undefined) {
    try {
      audit('3.1:DecremetingUserBookingCount');
      await decrementUserBookingCount(config, newBooking.user, startOfWeek);
      audit('3.1:DecremetingOfficeBookingCount');
      await decrementOfficeBookingCount(
        config,
        requestedOffice.id,
        newBooking.date,
        newBooking.parking
      );
      throw new HttpError({
        internalMessage: `Duplicate booking found for ${userEmail} on date: ${newBooking.date}`,
        status: 409,
        httpMessage: `Can't have multiple bookings per day`,
      });
    } catch (err) {
      if (err instanceof HttpError) {
        throw err;
      }
      throw new HttpError({
        internalMessage: `Failed while rollowing back duplicate booking found for ${userEmail} on date: ${newBooking.date}\n${err.message}`,
        level: 'ERROR',
        status: 409,
        httpMessage: `Can't have multiple bookings per day`,
      });
    }
  }

  audit('4:Completed');
  if (config.reasonToBookRequired && request.reasonToBook && config.env !== 'test') {
    const { notificationToAddress, fromAddress } = checkReasonEnv(config);
    await sendNotificationEmail(notificationToAddress, fromAddress, request.reasonToBook);
  }
  return mapBooking(config, createdBooking);
};
