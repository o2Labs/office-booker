import React from 'react';
import { rest } from 'msw';
import { render, fireEvent, waitFor, screen, queries } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { server } from '../../../../test/server.mock';
import {
  createFakeBooking,
  createFakeConfig,
  createFakeOffice,
  createFakeSystemAdminUser,
} from '../../../../test/data';
import { TestContext } from '../../../../test/TestContext';
import { mockGetBookings, mockGetOffices } from '../../../../test/handlers';

import Bookings from './Bookings';
import { configureAuth } from '../../../lib/auth';

test('No bookings', async () => {
  const config = createFakeConfig();
  const office = createFakeOffice();
  const user = createFakeSystemAdminUser([office]);
  server.use(mockGetOffices([office]), mockGetBookings([]));
  configureAuth(config);
  render(
    <TestContext user={user} config={config}>
      <Bookings />
    </TestContext>
  );

  await screen.findByText('No bookings found');
});

test('Has one booking', async () => {
  const config = createFakeConfig();
  const office = createFakeOffice();
  const user = createFakeSystemAdminUser([office]);
  const booking = createFakeBooking({ office, user: 'bookinguser@domain.test' });
  server.use(mockGetOffices([office]), mockGetBookings([booking]));
  configureAuth(config);
  render(
    <TestContext user={user} config={config}>
      <Bookings />
    </TestContext>
  );

  await screen.findByText('bookinguser@domain.test');
  screen.getByRole('button', { name: 'Cancel' });
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
    mockGetBookings([booking]),
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

  const cancelButton = await screen.findByRole('button', { name: 'Cancel' });
  fireEvent.click(cancelButton);

  const dialog = await screen.findByRole('dialog');
  queries.getByText(dialog, 'Are you sure you want to cancel this booking?');
  fireEvent.click(queries.getByRole(dialog, 'button', { name: 'Yes' }));

  await screen.findByText('Booking cancelled');
  expect(deleteReq).toHaveBeenCalledWith({ bookingId: booking.id, user: booking.user });
});
