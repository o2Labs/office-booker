import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { server } from '../../../test/server.mock';
import { createFakeOfficeWithSlots, createFakeSystemAdminUser } from '../../../test/data';
import { TestContext } from '../../../test/TestContext';
import { mockGetBookings, mockGetOffice, mockGetOffices } from '../../../test/handlers';

import Home from './Home';

test('Selecting an office', async () => {
  const office = createFakeOfficeWithSlots();
  const user = createFakeSystemAdminUser([office]);
  server.use(mockGetOffices([office]), mockGetBookings([]), mockGetOffice(office));
  render(
    <TestContext user={user}>
      <Home />
    </TestContext>
  );

  await screen.findByRole('heading', { level: 2, name: 'Select your office' });

  fireEvent.click(screen.getByRole('button', { name: office.name }));

  await screen.findByRole('heading', { level: 2, name: office.name });
  expect(screen.getByText(/You can make/i)).toHaveTextContent(`You can make 5 booking per week`);
  expect(screen.getByText(/daily capacity/i)).toHaveTextContent(
    `The Office has a daily capacity of 100 and car park capacity of 100.`
  );
});
