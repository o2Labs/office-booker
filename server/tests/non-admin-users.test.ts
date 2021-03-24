import { format } from 'date-fns';
import { encode } from 'querystring';
import { configureServer, getNormalUser, expectForbidden, officeQuotas } from './test-utils';

const { app, resetDb } = configureServer('non-admin-users');
const normalUserEmail = getNormalUser();
const otherUser = getNormalUser();

beforeEach(resetDb);

const userTypes: { [key: string]: string } = {
  normal: normalUserEmail,
};

describe.each(Object.keys(userTypes))('Non-admin user actions', (userType) => {
  const email = userTypes[userType];
  describe(`${userType} user`, () => {
    test(`can get self`, async () => {
      const response = await app.get(`/api/users/${email}`).set('bearer', email);
      expect(response.ok).toBe(true);
      expect(response.body).toEqual({
        email,
        quota: 1,
        admin: false,
        autoApproved: false,
        role: { name: 'Default' },
        permissions: {
          canEditUsers: false,
          canManageAllBookings: false,
          canViewAdminPanel: false,
          canViewUsers: false,
          officesCanManageBookingsFor: [],
        },
      });
    });

    test(`can't get others`, async () => {
      const response = await app.get(`/api/users/${otherUser}`).set('bearer', email);
      expectForbidden(response);
    });

    test(`can't see all bookings`, async () => {
      const response = await app.get('/api/bookings').set('bearer', email);
      expectForbidden(response);
    });

    test(`can't create bookings for other people`, async () => {
      const response = await app
        .post('/api/bookings')
        .send({
          user: otherUser,
          office: { id: officeQuotas[0].id },
          date: format(new Date(), 'yyyy-MM-dd'),
          parking: false,
        })
        .set('bearer', email);
      expectForbidden(response);
    });

    test(`can't delete booking for other people`, async () => {
      const response = await app
        .delete(`/api/bookings/${format(new Date(), 'yyyyMMdd')}?${encode({ user: otherUser })}`)
        .set('bearer', email);
      expectForbidden(response);
    });

    test(`can't delete today's booking`, async () => {
      const createBookingBody = {
        user: email,
        office: { id: officeQuotas[0].id },
        date: format(new Date(), 'yyyy-MM-dd'),
        parking: true,
      };
      const createResponse = await app
        .post('/api/bookings')
        .send(createBookingBody)
        .set('bearer', email);
      expect(createResponse.ok).toBe(true);

      const response = await app
        .delete(`/api/bookings/${createResponse.body.id}`)
        .set('bearer', email);
      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        message: 'No longer able to cancel booking',
      });
    });

    test(`can't set user quotas`, async () => {
      const putUserBody = {
        quota: 42,
      };
      const response = await app.put(`/api/users/${email}`).send(putUserBody).set('bearer', email);
      expectForbidden(response);
    });

    test(`can't query admin users`, async () => {
      const response = await app.get(`/api/users?role=System Admin`).set('bearer', email);
      expectForbidden(response);
    });

    test(`can't query custom quota users`, async () => {
      const response = await app.get(`/api/users?quota=custom`).set('bearer', email);
      expectForbidden(response);
    });
  });
});
