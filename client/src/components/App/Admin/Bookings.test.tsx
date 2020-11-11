import React from 'react';
import { render, fireEvent, waitFor, screen, queries } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Bookings from './Bookings';
import { configureAuth } from '../../../lib/auth';
import { server } from '../../../../test/server.mock';
import {
  createFakeBooking,
  createFakeConfig,
  createFakeOffice,
  createFakeSystemAdminUser,
} from '../../../../test/data';
import { TestContext } from '../../../../test/TestContext';
import { rest } from 'msw';
import { Office } from '../../../types/api';

function mockGetOffices(officesResponse: Office[]) {
  return rest.get('/api/offices', (req, res, ctx) => {
    return res(ctx.json(officesResponse));
  });
}

test('No bookings', async () => {
  const config = createFakeConfig();
  const office = createFakeOffice();
  const user = createFakeSystemAdminUser([office]);
  server.use(
    mockGetOffices([office]),
    rest.get('/api/bookings', (req, res, ctx) => {
      return res(ctx.json([]));
    })
  );
  configureAuth(config);
  render(
    <TestContext user={user} config={config}>
      <Bookings />
    </TestContext>
  );

  await waitFor(() => {
    screen.getAllByText('No bookings found');
  });
});

test('Has one booking', async () => {
  const config = createFakeConfig();
  const office = createFakeOffice();
  const user = createFakeSystemAdminUser([office]);
  const booking = createFakeBooking({ office, user: 'bookinguser@domain.test' });
  server.use(
    mockGetOffices([office]),
    rest.get('/api/bookings', (req, res, ctx) => {
      return res(ctx.json([booking]));
    })
  );
  configureAuth(config);
  render(
    <TestContext user={user} config={config}>
      <Bookings />
    </TestContext>
  );

  await waitFor(() => {
    screen.getAllByText('bookinguser@domain.test');
  });
  screen.getByText('Cancel');
  expect(screen.getByText(/Bookings:/)?.nextSibling).toHaveTextContent('1');
});

test('Can cancel booking', async () => {
  const config = createFakeConfig();
  const office = createFakeOffice();
  const user = createFakeSystemAdminUser([office]);
  const booking = createFakeBooking({ office, user: 'bookinguser@domain.test' });
  configureAuth(config);
  const deleteReq = jest.fn();
  server.use(
    mockGetOffices([office]),
    rest.get('/api/bookings', (req, res, ctx) => {
      return res(ctx.json([booking]));
    }),
    rest.delete(`/api/bookings/:bookingId`, (req, res, ctx) => {
      deleteReq({ bookingId: req.params.bookingId, user: req.url.searchParams.get('user') });
      return res(ctx.status(200));
    })
  );
  render(
    <TestContext user={user} config={config}>
      <Bookings />
    </TestContext>
  );

  await waitFor(() => {
    screen.getByText('Cancel');
  });

  fireEvent.click(screen.getByText('Cancel'));

  await waitFor(() => {
    screen.getByText('Are you sure you want to cancel this booking?');
  });

  const dialog = screen.getByRole('dialog');
  fireEvent.click(queries.getByText(dialog, 'Yes'));

  await waitFor(() => {
    screen.getByText('Booking cancelled');
  });
  expect(deleteReq).toHaveBeenCalledWith({ bookingId: booking.id, user: booking.user });
});
