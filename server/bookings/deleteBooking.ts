import { Config } from '../app-config';
import { decrementOfficeBookingCount } from '../db/officeBookings';
import { deleteBooking as deleteBookingDb, getBooking, BookingsModel } from '../db/bookings';
import { dateStartOfWeek } from '../availableDates';
import { decrementUserBookingCount } from '../db/userBookings';
import { parseISO, isAfter } from 'date-fns';
import { getBookingLastCancelTime } from './model';
import { CustomError, NotFound, Forbidden, HttpError } from '../errors';
import { User } from '../users/model';

const audit = (step: string, details?: any) =>
  console.info(
    JSON.stringify({
      level: 'AUDIT',
      action: 'DeleteBooking',
      step,
      details,
    })
  );

const canManageBooking = (authUser: User, booking: BookingsModel) =>
  authUser.permissions.canManageAllBookings ||
  authUser.permissions.officesCanManageBookingsFor.find(
    (office) => office.name === booking.office
  ) !== undefined;

export const deleteBooking = async (
  config: Config,
  currentUser: User,
  bookingToDelete: { id: string; email: string }
): Promise<void> => {
  const booking = await getBooking(config, bookingToDelete.id, bookingToDelete.email);

  const isEditingSelf = booking !== undefined && booking.user === currentUser.email;
  const canManageOfficeBookings = booking !== undefined && canManageBooking(currentUser, booking);
  const isAuthorised = isEditingSelf || canManageOfficeBookings;

  if (!isAuthorised) {
    throw new Forbidden(
      `${currentUser.email} tried to delete another user's booking but is not admin, or office admin`
    );
  }

  if (booking === undefined) {
    throw new NotFound();
  }

  const startOfWeek = dateStartOfWeek(booking.date);

  if (
    !canManageBooking(currentUser, booking) &&
    isAfter(new Date(), parseISO(getBookingLastCancelTime(booking.date)))
  ) {
    throw new HttpError({
      internalMessage: `Booking can no longer be cancelled. id: ${booking.id} for ${booking.user}`,
      status: 400,
      httpMessage: 'No longer able to cancel booking',
    });
  }

  audit('1:DeletingBooking', { booking, startOfWeek, currentUser: { email: currentUser.email } });
  await deleteBookingDb(config, booking.id, booking.user);

  try {
    audit('2:DecrementingOfficeBookingCount');
    await decrementOfficeBookingCount(config, booking.office, booking.date, booking.parking);
    audit('3:DecrementingUserBookingCount');
    await decrementUserBookingCount(config, booking.user, startOfWeek);
  } catch (err) {
    throw new CustomError(
      `Deleted booking but failed while decremeting counts: ${JSON.stringify(booking)}`,
      err
    );
  }

  audit('4:Completed');
};
