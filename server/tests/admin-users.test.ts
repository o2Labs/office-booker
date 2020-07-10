import { format } from 'date-fns';
import { configureServer, otherUser, adminUserEmail } from './test-utils';
import { encode } from 'querystring';
import { officeQuotas } from './test-utils';

const { app, resetDb } = configureServer('admin-users');

beforeAll(resetDb);

test(`can get others`, async () => {
  const response = await app.get(`/api/users/${otherUser}`).set('bearer', adminUserEmail);
  expect(response.status).toBe(200);
});

test(`can see all bookings`, async () => {
  const response = await app.get('/api/bookings').set('bearer', adminUserEmail);
  expect(response.ok).toBe(true);
});

test('can query admin users', async () => {
  const getInitialUserResponse = await app
    .get(`/api/users?role=System Admin`)
    .set('bearer', adminUserEmail);
  expect(getInitialUserResponse.body).toEqual([
    {
      email: adminUserEmail,
      quota: 1,
      admin: true,
      role: { name: 'System Admin' },
      permissions: {
        canEditUsers: true,
        canManageAllBookings: true,
        canViewAdminPanel: true,
        canViewUsers: true,
        officesCanManageBookingsFor: ['Office A', 'Office B'],
      },
    },
  ]);
});

test('can query custom quota users', async () => {
  const queryResponse = await app.get(`/api/users?quota=custom`).set('bearer', adminUserEmail);
  expect(queryResponse.ok).toBe(true);
});

test('can create and delete bookings for other people', async () => {
  const createBookingBody = {
    user: otherUser,
    office: officeQuotas[0].name,
    date: format(new Date(), 'yyyy-MM-dd'),
    parking: false,
  };
  const createResponse = await app
    .post('/api/bookings')
    .send(createBookingBody)
    .set('bearer', adminUserEmail);
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
    .get(`/api/bookings?user=${otherUser}`)
    .set('bearer', adminUserEmail);
  expect(getCreatedBookingResponse.body).toContainEqual(createResponse.body);

  const deleteResponse = await app
    .delete(`/api/bookings/${createResponse.body.id}?${encode({ user: otherUser })}`)
    .set('bearer', adminUserEmail);
  expect(deleteResponse.status).toBe(204);

  const getDeletedBookingResponse = await app
    .get(`/api/bookings?user=${otherUser}`)
    .set('bearer', adminUserEmail);
  expect(getDeletedBookingResponse.body).not.toContainEqual(createResponse.body);
});

test('can set user quotas', async () => {
  try {
    const getInitialUserResponse = await app
      .get(`/api/users/${otherUser}`)
      .set('bearer', adminUserEmail);
    expect(getInitialUserResponse.body).toMatchObject({ quota: 1 });

    const putUserBody = {
      quota: 42,
    };
    const putResponse = await app
      .put(`/api/users/${otherUser}`)
      .send(putUserBody)
      .set('bearer', adminUserEmail);
    expect(putResponse.status).toBe(200);

    const queryResponse = await app.get(`/api/users?quota=custom`).set('bearer', adminUserEmail);
    expect(queryResponse.body).toContainEqual(putResponse.body);

    const getUpdatedUserResponse = await app
      .get(`/api/users/${otherUser}`)
      .set('bearer', adminUserEmail);
    expect(getUpdatedUserResponse.body).toEqual(putResponse.body);
  } finally {
    // Reset back to 1
    await app.put(`/api/users/${otherUser}`).send({ quota: 1 }).set('bearer', adminUserEmail);
  }
});

test('can set user role', async () => {
  try {
    const getInitialUserResponse = await app
      .get(`/api/users/${otherUser}`)
      .set('bearer', adminUserEmail);
    expect(getInitialUserResponse.body).toMatchObject({ role: { name: 'Default' } });

    const putUserBody = {
      role: { name: 'Office Admin', offices: [officeQuotas[0].name] },
    };
    const putResponse = await app
      .put(`/api/users/${otherUser}`)
      .send(putUserBody)
      .set('bearer', adminUserEmail);
    expect(putResponse.status).toBe(200);

    const queryResponse = await app
      .get(`/api/users?role=Office Admin`)
      .set('bearer', adminUserEmail);
    expect(queryResponse.body).toContainEqual(putResponse.body);

    const getUpdatedUserResponse = await app
      .get(`/api/users/${otherUser}`)
      .set('bearer', adminUserEmail);
    expect(getUpdatedUserResponse.body).toEqual(putResponse.body);
  } finally {
    // Reset back to default
    await app
      .put(`/api/users/${otherUser}`)
      .send({ role: { name: 'Default' } })
      .set('bearer', adminUserEmail);
  }
});
