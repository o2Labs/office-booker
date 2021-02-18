import React from 'react';
import { render, fireEvent, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { server } from '../../../test/server.mock';
import {
  createFakeConfig,
  createFakeOfficeWithSlots,
  createFakeSystemAdminUser,
} from '../../../test/data';
import { TestContext } from '../../../test/TestContext';
import {
  mockGetBookings,
  mockGetConfig,
  mockGetOffice,
  mockGetOffices,
} from '../../../test/handlers';

import Home from './Home';

test('Selecting an office', async () => {
  const config = createFakeConfig();
  const office = createFakeOfficeWithSlots(config);
  const user = createFakeSystemAdminUser([office], { quota: 2 });
  server.use(
    mockGetConfig(config),
    mockGetOffices([office]),
    mockGetBookings([]),
    mockGetOffice(office)
  );
  render(
    <TestContext user={user}>
      <Home />
    </TestContext>
  );

  await screen.findByRole('heading', { level: 2, name: 'Select your office' });

  const main = within(screen.getByRole('main'));

  fireEvent.click(main.getByRole('button', { name: office.name }));

  await main.findByRole('heading', { level: 2, name: office.name });
  expect(main.getByText(/You can make/i)).toHaveTextContent(
    `You can make ${user.quota} booking per week`
  );
  expect(main.getByText(/daily capacity/i)).toHaveTextContent(
    `The Office has a daily capacity of ${office.quota} and car park capacity of ${office.parkingQuota}.`
  );
  expect(main.getByText(/bookings remaining/i)).toHaveTextContent(
    `${user.quota} bookings remaining`
  );

  await main.findAllByRole('button', { name: 'Book' });
});
