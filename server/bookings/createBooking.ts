import { CreateBooking, Booking, mapBooking } from './model';
import { Config } from '../app-config';
import { createBooking as dbCreate } from '../db/bookings';
import { parse } from 'date-fns';
import { getAvailableDates, dateStartOfWeek } from '../availableDates';
import { incrementOfficeBookingCount, decrementOfficeBookingCount } from '../db/officeBookings';
import { incrementUserBookingCount, decrementUserBookingCount } from '../db/userBookings';
import { Forbidden, HttpError } from '../errors';
import { User, getUser } from '../users/model';

const audit = (step: string, details?: any) =>
  console.info(
    JSON.stringify({
      level: 'AUDIT',
      action: 'CreateBooking',
      step,
      details,
    })
  );

export const createBooking = async (
  config: Config,
  currentUser: User,
  request: CreateBooking
): Promise<Booking> => {
  const isAuthorised =
    request.user === currentUser.email ||
    currentUser.permissions.canManageAllBookings ||
    currentUser.permissions.officesCanManageBookingsFor.includes(request.office);

  if (!isAuthorised) {
    throw new Forbidden();
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

  const requestedOffice = config.officeQuotas.find((office) => office.name === request.office);
  if (!requestedOffice) {
    throw new HttpError({
      internalMessage: `Office not found: ${request.office}`,
      status: 400,
      httpMessage: 'Office not found',
    });
  }

  // Id date as a direct string
  const id = requestedOffice.id + '_' + request.date.replace(/-/gi, '');
  const newBooking = {
    ...request,
    id,
  };

  const userEmail = request.user.toLocaleLowerCase();
  const startOfWeek = dateStartOfWeek(request.date);

  audit('1:IncrementingOfficeBookingCount', { newBooking, startOfWeek, currentUser });
  const officeBookedSuccessfully = await incrementOfficeBookingCount(
    config,
    requestedOffice,
    request.date,
    request.parking
  );

  if (!officeBookedSuccessfully) {
    throw new HttpError({
      internalMessage: `Office quota of ${requestedOffice.quota} has exceeded for ${requestedOffice.name} on date: ${request.date}`,
      status: 409,
      httpMessage: 'Office quota exceeded',
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
    await decrementOfficeBookingCount(config, requestedOffice.name, request.date, request.parking);
    throw new HttpError({
      internalMessage: `User quota of ${dbUser.quota} has exceeded for ${userEmail} on date: ${request.date}`,
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
        requestedOffice.name,
        request.date,
        request.parking
      );
      throw new HttpError({
        internalMessage: `Duplicate booking found for ${userEmail} on date: ${request.date}`,
        status: 409,
        httpMessage: `Can't have multiple bookings per day`,
      });
    } catch (err) {
      throw new HttpError({
        internalMessage: `Failed while rollowing back duplicate booking found for ${userEmail} on date: ${request.date}\n${err.message}`,
        status: 409,
        httpMessage: `Can't book more than one office per day`,
      });
    }
  }

  audit('4:Completed');
  return mapBooking(createdBooking);
};
