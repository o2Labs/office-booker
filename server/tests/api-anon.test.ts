import { format } from 'date-fns';
import { configureServer, expectUnauthorised, normalUserEmail, officeQuotas } from './test-utils';

const { app, resetDb } = configureServer('anon-users');

beforeAll(resetDb);

test('get user', async () => {
  const response = await app.get(`/api/users/${normalUserEmail}`);
  expectUnauthorised(response);
});

test('get list of offices', async () => {
  const response = await app.get(`/api/offices`);
  expectUnauthorised(response);
});

test('get bookings', async () => {
  const response = await app.get('/api/bookings');
  expectUnauthorised(response);
});

test('get bookings by user', async () => {
  const response = await app.get(`/api/bookings?user=${normalUserEmail}`);
  expectUnauthorised(response);
});

test('create booking', async () => {
  const response = await app.post('/api/bookings').send({
    user: normalUserEmail,
    office: officeQuotas[0].name,
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  expectUnauthorised(response);
});

test('delete booking', async () => {
  const response = await app.delete(`/api/bookings/${format(new Date(), 'yyyyMMdd')}`);
  expectUnauthorised(response);
});
