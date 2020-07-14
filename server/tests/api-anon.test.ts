import { format } from 'date-fns';
import { configureServer, expectUnauthorized, getNormalUser, officeQuotas } from './test-utils';

const { app, resetDb } = configureServer('anon-users');
const normalUserEmail = getNormalUser();

beforeEach(resetDb);

test('get user', async () => {
  const response = await app.get(`/api/users/${normalUserEmail}`);
  expectUnauthorized(response);
});

test('get list of offices', async () => {
  const response = await app.get(`/api/offices`);
  expectUnauthorized(response);
});

test('get bookings', async () => {
  const response = await app.get('/api/bookings');
  expectUnauthorized(response);
});

test('get bookings by user', async () => {
  const response = await app.get(`/api/bookings?user=${normalUserEmail}`);
  expectUnauthorized(response);
});

test('create booking', async () => {
  const response = await app.post('/api/bookings').send({
    user: normalUserEmail,
    office: officeQuotas[0].name,
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  expectUnauthorized(response);
});

test('delete booking', async () => {
  const response = await app.delete(`/api/bookings/${format(new Date(), 'yyyyMMdd')}`);
  expectUnauthorized(response);
});
