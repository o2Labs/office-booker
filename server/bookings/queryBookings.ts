import { Config, OfficeQuota } from '../app-config';
import { mapBookings } from './model';
import {
  getUserBookings,
  getAllBookings,
  BookingsModel,
  queryBookings as queryBookingsDb,
} from '../db/bookings';
import { User } from '../users/model';
import { Forbidden } from '../errors';

export type BookingsQuery = { email?: string; office?: OfficeQuota; date?: string };

export const queryBookings = async (config: Config, currentUser: User, query: BookingsQuery) => {
  const isQueryingSelf = query.email && query.email === currentUser.email;
  const isOfficeAdmin =
    query.office !== undefined &&
    currentUser.permissions.officesCanManageBookingsFor.find(
      (office) => office.name === query.office?.name
    ) !== undefined;

  const isAuthorised =
    isQueryingSelf || isOfficeAdmin || currentUser.permissions.canManageAllBookings;
  if (!isAuthorised) {
    throw new Forbidden();
  }

  const filterBookings = (booking: BookingsModel) =>
    (!query.office || booking.officeId === query.office.id) &&
    (!query.date || booking.date === query.date) &&
    (!query.email || booking.user === query.email);

  if (query.email) {
    const userBookings = await getUserBookings(config, query.email);
    return mapBookings(config, userBookings.filter(filterBookings));
  } else if (query.office !== undefined) {
    const officeBookings = await queryBookingsDb(config, {
      officeId: query.office.id,
      date: query.date,
    });
    return mapBookings(config, officeBookings.filter(filterBookings));
  } else {
    const allBookings = await getAllBookings(config);
    return mapBookings(config, allBookings.filter(filterBookings));
  }
};
