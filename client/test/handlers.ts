import { rest } from 'msw';
import { Config } from '../src/context/stores';
import { Booking, Office, OfficeWithSlots, User } from '../src/types/api';
import { createFakeConfig } from './data';

export const mockGetConfig = (config: Config) =>
  rest.get('/api/config', (req, res, ctx) => res(ctx.json(config)));

export const mockGetOffices = (officesResponse: Office[]) =>
  rest.get('/api/offices', (req, res, ctx) => res(ctx.json(officesResponse)));

export const mockGetOffice = (officeResponse: OfficeWithSlots) =>
  rest.get(`/api/offices/${officeResponse.id}`, (req, res, ctx) => res(ctx.json(officeResponse)));

export const mockGetBookings = (bookings: Booking[]) =>
  rest.get('/api/bookings', (req, res, ctx) => res(ctx.json(bookings)));

export const mockPostUser = () => rest.post('/api/users', (req, res, ctx) => res(ctx.status(200)));

export const mockGetUser = (user: User) =>
  rest.get('/api/users/:user', (req, res, ctx) => res(ctx.json(user)));
