import { parseISO, endOfDay } from 'date-fns';
import { BookingsModel as DbBooking } from '../db/bookings';
import { OfficeQuota, Config } from '../app-config';
import { Arrays } from 'collection-fns';

export type CreateBooking = {
  user: string;
  date: string;
  office: { id: string };
  parking?: boolean;
};

export type RestoreBooking = CreateBooking & { id: string; created: string };

export const isCreateBooking = (arg: any): arg is CreateBooking =>
  typeof arg.user === 'string' &&
  typeof arg.date === 'string' &&
  typeof arg.office === 'object' &&
  'id' in arg.office &&
  typeof arg.office.id === 'string' &&
  (typeof arg.parking === 'undefined' || typeof arg.parking === 'boolean');

export type Booking = {
  id: string;
  created: string;
  user: string;
  date: string;
  office: OfficeQuota;
  lastCancellation: string;
  parking: boolean;
};

const lastCancelTime = '00:00:00';

export const getBookingLastCancelTime = (date: string) =>
  parseISO(`${date}T${lastCancelTime}`).toISOString();

export const getBookingAdminLastCancelTime = (date: string) =>
  endOfDay(parseISO(date)).toISOString();

export const mapBooking = (config: Config, booking: DbBooking): Booking => ({
  id: booking.id,
  created: booking.created,
  user: booking.user,
  date: booking.date,
  office: Arrays.get(config.officeQuotas, (office) => office.id === booking.officeId),
  lastCancellation: getBookingLastCancelTime(booking.date),
  parking: booking.parking,
});

export const mapBookings = (config: Config, bookings: DbBooking[]): Booking[] =>
  bookings.map((booking) => mapBooking(config, booking));
