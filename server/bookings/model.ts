import { parseISO } from 'date-fns';
import { BookingsModel as DbBooking } from '../db/bookings';

export type CreateBooking = {
  user: string;
  date: string;
  office: string;
  bookParking: boolean;
};

export const isCreateBooking = (arg: any): arg is CreateBooking =>
  typeof arg.user === 'string' &&
  typeof arg.date === 'string' &&
  typeof arg.office === 'string' &&
  typeof arg.bookParking === 'boolean';

export type Booking = {
  id: string;
  created: string;
  user: string;
  date: string;
  office: string;
  lastCancellation: string;
};

const lastCancelTime = '00:00:00';

export const getBookingLastCancelTime = (date: string) =>
  parseISO(`${date}T${lastCancelTime}`).toISOString();

export const mapBooking = (booking: DbBooking): Booking => ({
  id: booking.id,
  created: booking.created,
  user: booking.user,
  date: booking.date,
  office: booking.office,
  lastCancellation: getBookingLastCancelTime(booking.date),
});

export const mapBookings = (bookings: DbBooking[]): Booking[] => bookings.map(mapBooking);
