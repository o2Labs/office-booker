import React from 'react';
import { render, fireEvent, waitFor, screen, queries } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Bookings from './Bookings';
import { configureAuth } from '../../../lib/auth';
import {
  mockBookingsResponse,
  mockOfficesResponse,
} from '../../../../test/server.mock';
import {
  createFakeBooking,
  createFakeConfig,
  createFakeOffice,
  createFakeSystemAdminUser,
} from '../../../../test/data';
import { TestContext } from '../../../../test/TestContext';

test('No bookings', async () => {
  const config = createFakeConfig();
  const office = createFakeOffice();
  const user = createFakeSystemAdminUser([office]);
  configureAuth(config);
  mockOfficesResponse([office]);
  mockBookingsResponse([]);
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
  configureAuth(config);
  mockOfficesResponse([office]);
  mockBookingsResponse([booking]);
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
