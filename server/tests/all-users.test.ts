import { format, addDays } from 'date-fns';
import { configureServer, getNormalUser, adminUserEmail, officeQuotas } from './test-utils';
import { setUser } from '../db/users';

const { app, resetDb, config } = configureServer('all-users');
const normalUserEmail = getNormalUser();
const officeAdminEmail = 'office-a.admin@office-booker.test';

const office = officeQuotas[0];
beforeEach(async () => {
  await resetDb();
  await setUser(config, {
    email: officeAdminEmail,
    adminOffices: [office.name],
    quota: 1,
  });
});

const userTypes: { [key: string]: string } = {
  normal: normalUserEmail,
  admin: adminUserEmail,
  officeAdmin: officeAdminEmail,
};

describe.each(Object.keys(userTypes))('All-user permitted actions', (userType) => {
  const email = userTypes[userType];
  describe(`${userType} user`, () => {
    test(`can get self`, async () => {
      const response = await app.get(`/api/users/${email}`).set('bearer', email);
      expect(response.ok).toBe(true);
      expect(Object.keys(response.body)).toEqual([
        'email',
        'admin',
        'quota',
        'role',
        'permissions',
      ]);
      expect(typeof response.body?.admin).toBe('boolean');
      expect(response.body?.quota).toBeGreaterThanOrEqual(0);
    });

    test(`can get list of offices`, async () => {
      const response = await app.get(`/api/offices`).set('bearer', email);
      expect(response.ok).toBe(true);
      expect(response.body).toHaveLength(officeQuotas.length);
      expect(Object.keys(response.body[0])).toEqual(['id', 'name', 'quota', 'parkingQuota']);
    });

    test(`can get single office`, async () => {
      const response = await app.get(`/api/offices/${officeQuotas[0].id}`).set('bearer', email);
      expect(response.ok).toBe(true);
      expect(Object.keys(response.body)).toEqual(['id', 'name', 'quota', 'parkingQuota', 'slots']);
      expect(Object.keys(response.body.slots[0])).toEqual(['date', 'booked', 'bookedParking']);
    });

    test('can get own bookings', async () => {
      const response = await app.get(`/api/bookings?user=${email}`).set('bearer', email);
      expect(response.ok).toBe(true);
    });

    test('can create and delete own booking', async () => {
      const createBookingBody = {
        user: email,
        office: { id: officeQuotas[0].id },
        date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        parking: true,
      };
      const createResponse = await app
        .post('/api/bookings')
        .send(createBookingBody)
        .set('bearer', email);
      expect(createResponse.ok).toBe(true);
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
        .get(`/api/bookings?user=${email}`)
        .set('bearer', email);
      expect(getCreatedBookingResponse.body).toContainEqual(createResponse.body);

      const deleteResponse = await app
        .delete(`/api/bookings/${createResponse.body.id}`)
        .set('bearer', email);
      expect(deleteResponse.status).toBe(204);

      const getDeletedBookingResponse = await app
        .get(`/api/bookings?user=${email}`)
        .set('bearer', email);
      expect(getDeletedBookingResponse.body).not.toContainEqual(createResponse.body);
    });
  });
});
