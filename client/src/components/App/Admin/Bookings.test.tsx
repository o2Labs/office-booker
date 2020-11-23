import React from 'react';
import { rest } from 'msw';
import { render, fireEvent, screen, queries } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { server } from '../../../../test/server.mock';
import {
  createFakeBooking,
  createFakeOffice,
  createFakeSystemAdminUser,
} from '../../../../test/data';
import { TestContext } from '../../../../test/TestContext';
import { mockGetBookings, mockGetOffices } from '../../../../test/handlers';

import Bookings from './Bookings';

test('No bookings', async () => {
  const office = createFakeOffice();
  const user = createFakeSystemAdminUser([office]);
  server.use(mockGetOffices([office]), mockGetBookings([]));
  render(
    <TestContext user={user}>
      <Bookings />
    </TestContext>
  );

  await screen.findByText('No bookings found');
});

test('Has one booking', async () => {
  const office = createFakeOffice();
  const user = createFakeSystemAdminUser([office]);
  const booking = createFakeBooking({ office, user: 'bookinguser@domain.test' });
  server.use(mockGetOffices([office]), mockGetBookings([booking]));
  render(
    <TestContext user={user}>
      <Bookings />
    </TestContext>
  );

  await screen.findByText('bookinguser@domain.test');
  screen.getByRole('button', { name: 'Cancel' });
  expect(screen.getByText(/Bookings:/)?.nextSibling).toHaveTextContent('1');
});

test('Can cancel booking', async () => {
  const office = createFakeOffice();
  const user = createFakeSystemAdminUser([office]);
  const booking = createFakeBooking({ office, user: 'bookinguser@domain.test' });
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
    <TestContext user={user}>
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
