import { rest } from 'msw';
import { Booking, Office } from '../src/types/api';

export const mockGetOffices = (officesResponse: Office[]) =>
  rest.get('/api/offices', (req, res, ctx) => {
    return res(ctx.json(officesResponse));
  });

export const mockGetBookings = (bookings: Booking[]) =>
  rest.get('/api/bookings', (req, res, ctx) => {
    return res(ctx.json(bookings));
  });
