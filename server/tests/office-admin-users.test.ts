import { format } from 'date-fns';
import { configureServer, getNormalUser, expectForbidden } from './test-utils';
import { encode } from 'querystring';
import { setUser } from '../db/users';
import { officeQuotas } from './test-utils';
import { createBooking } from '../db/bookings';

const { app, resetDb, config } = configureServer('office-admin-users');
const otherUser = getNormalUser();

const officeAdminEmail = 'office-a.admin@office-booker.test';

const office = officeQuotas[0];
beforeEach(async () => {
  await resetDb();
  await setUser(config, {
    email: officeAdminEmail,
    adminOffices: [office.name],
    quota: 1,
    created: new Date().toISOString(),
  });
});

test(`can get self`, async () => {
  const response = await app.get(`/api/users/${officeAdminEmail}`).set('bearer', officeAdminEmail);
  expect(response.ok).toBe(true);
  expect(response.body).toEqual({
    email: officeAdminEmail,
    quota: 1,
    admin: false,
    role: { name: 'Office Admin', offices: [office] },
    permissions: {
      canEditUsers: false,
      canManageAllBookings: false,
      canViewAdminPanel: true,
      canViewUsers: true,
      officesCanManageBookingsFor: [office],
    },
  });
});

test(`can get other users`, async () => {
  const response = await app.get(`/api/users/${otherUser}`).set('bearer', officeAdminEmail);
  expect(response.status).toBe(200);
});

test('can query admin users', async () => {
  const response = await app.get(`/api/users?role=System Admin`).set('bearer', officeAdminEmail);
  expect(response.ok).toBe(true);
});

test('can query custom quota users', async () => {
  const response = await app.get(`/api/users?quota=custom`).set('bearer', officeAdminEmail);
  expect(response.ok).toBe(true);
});

test(`can't set user quotas`, async () => {
  const putUserBody = {
    quota: 42,
  };
  const response = await app
    .put(`/api/users/${otherUser}`)
    .send(putUserBody)
    .set('bearer', officeAdminEmail);
  expectForbidden(response);
});

test(`can see office bookings`, async () => {
  const response = await app
    .get('/api/bookings?office=' + office.id)
    .set('bearer', officeAdminEmail);
  expect(response.ok).toBe(true);
});

test(`can't see all bookings`, async () => {
  const response = await app.get('/api/bookings').set('bearer', officeAdminEmail);
  expect(response.ok).toBe(false);
});

test('can create and delete bookings for other people for their office', async () => {
  const createBookingBody = {
    user: otherUser,
    office: { id: office.id },
    date: format(new Date(), 'yyyy-MM-dd'),
    parking: false,
  };

  console.log('booking DATE:', new Date().getTime());

  const createResponse = await app
    .post('/api/bookings')
    .send(createBookingBody)
    .set('bearer', officeAdminEmail);
  expect(createResponse.status).toBe(200);
  expect(Object.keys(createResponse.body)).toEqual([
    'id',
    'created',
    'user',
    'date',
    'office',
    'lastCancellation',
    'parking',
  ]);
  expect(typeof createResponse.body?.id).toBe('string');
  expect(createResponse.body).toMatchObject(createBookingBody);

  const getCreatedBookingResponse = await app
    .get(`/api/bookings?user=${otherUser}&office=${office.id}`)
    .set('bearer', officeAdminEmail);
  expect(getCreatedBookingResponse.body).toContainEqual(createResponse.body);

  const deleteResponse = await app
    .delete(`/api/bookings/${createResponse.body.id}?${encode({ user: otherUser })}`)
    .set('bearer', officeAdminEmail);
  expect(deleteResponse.status).toBe(204);

  const getDeletedBookingResponse = await app
    .get(`/api/bookings?user=${otherUser}`)
    .set('bearer', officeAdminEmail);
  expect(getDeletedBookingResponse.body).not.toContainEqual(createResponse.body);
});

test(`can't delete past bookings for other people`, async () => {
  const id = officeQuotas[1].id + '_' + format(new Date(), 'yyyy-MM-dd').replace(/-/gi, '');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const createBookingBody = {
    id: id,
    user: otherUser,
    office: officeQuotas[1].id,
    date: format(yesterday, 'yyyy-MM-dd'),
    parking: false,
  };

  const createdBooking = await createBooking(config, createBookingBody);

  const deleteResponse = await app
    .delete(`/api/bookings/${createdBooking?.id}?${encode({ user: otherUser })}`)
    .set('bearer', officeAdminEmail);
  expect(deleteResponse.status).toBe(403);
});

test(`can't create and delete bookings for other people for other offices`, async () => {
  const createBookingBody = {
    user: otherUser,
    office: { id: officeQuotas[1].id },
    date: format(new Date(), 'yyyy-MM-dd'),
    parking: false,
  };
  const createResponse = await app
    .post('/api/bookings')
    .send(createBookingBody)
    .set('bearer', officeAdminEmail);
  expectForbidden(createResponse);
});
