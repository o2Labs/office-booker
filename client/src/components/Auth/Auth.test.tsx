import React from 'react';
import { fireEvent, queries, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { server } from '../../../test/server.mock';
import { TestContext } from '../../../test/TestContext';

import RequireLogin from './RequireLogin';
import { createFakeConfig, createFakeUser } from '../../../test/data';
import { mockGetConfig, mockGetUser, mockPostUser } from '../../../test/handlers';

test('Logging in', async () => {
  server.use(
    mockGetConfig(createFakeConfig()),
    mockPostUser(),
    mockGetUser(createFakeUser({ email: 'test.user@domain.test' }))
  );
  render(
    <TestContext>
      <RequireLogin>
        <h2>Logged in</h2>
      </RequireLogin>
    </TestContext>
  );

  const loginButton = await screen.findByRole('button', { name: /Submit/i });
  fireEvent.click(loginButton);

  const alert = await screen.findByRole('alert');
  await queries.findByText(alert, 'Email address not permitted');

  const emailField = screen.getByLabelText(/Email Address/i);
  fireEvent.change(emailField, { target: { value: 'test.user@domain.test' } });
  fireEvent.click(loginButton);

  await screen.findByRole('heading', { name: /Verify/i });
  const codeField = screen.getByLabelText(/code/i);
  fireEvent.change(codeField, { target: { value: '123456' } });
  const submitButton = screen.getByRole('button', { name: /submit/i });
  fireEvent.click(submitButton);

  await screen.findByRole('heading', { name: /logged in/i });
});
