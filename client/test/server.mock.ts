import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { Booking, Office } from '../src/types/api';

let officesResponse: Office[] = [];

export const mockOfficesResponse = (offices: Office[]): void => {
  officesResponse = offices;
};

let bookingsResponse: Booking[] = [];

export const mockBookingsResponse = (bookings: Booking[]): void => {
  bookingsResponse = bookings;
};

const server = setupServer(
  rest.get('/api/offices', (req, res, ctx) => {
    return res(ctx.json(officesResponse));
  }),
  rest.get('/api/bookings', (req, res, ctx) => {
    return res(ctx.json(bookingsResponse));
  }),
  rest.get('*', (req, res, ctx) => {
    console.log(req.method, req.url.href);
    return res(ctx.status(404));
  }),
  rest.delete('*', (req, res, ctx) => {
    console.log(req.method, req.url.href);
    return res(ctx.status(404));
  }),
  rest.post('*', (req, res, ctx) => {
    console.log(req.method, req.url.href);
    return res(ctx.status(404));
  }),
  rest.put('*', (req, res, ctx) => {
    console.log(req.method, req.url.href);
    return res(ctx.status(404));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  officesResponse = [];
});
afterAll(() => server.close());
