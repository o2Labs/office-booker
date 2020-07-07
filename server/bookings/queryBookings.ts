import { Config } from '../app-config';
import { mapBookings } from './model';
import { getUserBookings, getAllBookings, BookingsModel } from '../db/bookings';
import { User } from '../users/model';
import { Forbidden } from '../errors';

export type BookingsQuery = { email?: string; office?: string };

export const queryBookings = async (config: Config, currentUser: User, query: BookingsQuery) => {
  const isEditingSelf = query.email && query.email === currentUser.email;
  const isOfficeAdmin =
    query.office !== undefined &&
    currentUser.permissions.officesCanManageBookingsFor.includes(query.office);
  const isAuthorised =
    isEditingSelf || isOfficeAdmin || currentUser.permissions.canManageAllBookings;
  if (!isAuthorised) {
    throw new Forbidden();
  }

  const filterBookings = (booking: BookingsModel) =>
    !query.office || booking.office === query.office;

  if (query.email) {
    const userBookings = await getUserBookings(config, query.email);
    return mapBookings(userBookings.filter(filterBookings));
  } else {
    const allBookings = await getAllBookings(config);
    return mapBookings(allBookings.filter(filterBookings));
  }
};
