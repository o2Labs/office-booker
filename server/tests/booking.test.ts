import { format, addDays } from 'date-fns';
import { configureServer, normalUserEmail, officeQuotas } from './test-utils';

const { app, resetDb } = configureServer('bookings');

beforeAll(resetDb);

describe('Testing DB logic', async () => {
  test('can create booking and successfully increase booking count', async () => {
    const office = officeQuotas[0].name;
    const date = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const createBookingBody = {
      user: normalUserEmail,
      office,
      date,
      parking: false,
    };
    const createResponse = await app
      .post('/api/bookings')
      .send(createBookingBody)
      .set('bearer', normalUserEmail);

    expect(createResponse.ok).toBe(true);

    const getCreatedBookingResponse = await app
      .get(`/api/bookings?user=${normalUserEmail}`)
      .set('bearer', normalUserEmail);
    expect(getCreatedBookingResponse.body).toContainEqual(createResponse.body);

    const getOfficeBookingsResponse = await app.get(`/api/offices`).set('bearer', normalUserEmail);
    const officeData = getOfficeBookingsResponse.body.find((item: any) => item.name === office);
    const slot = officeData.slots.find((item: any) => item.date === date);
    expect(slot.booked).toEqual(1);

    const deleteResponse = await app
      .delete(`/api/bookings/${createResponse.body.id}`)
      .set('bearer', normalUserEmail);
    expect(deleteResponse.status).toBe(204);
  });

  test('can delete booking and successfully decrease booking count', async () => {
    const office = officeQuotas[0].name;
    const date = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const createBookingBody = {
      user: normalUserEmail,
      office,
      date,
      parking: false,
    };
    const createResponse = await app
      .post('/api/bookings')
      .send(createBookingBody)
      .set('bearer', normalUserEmail);

    const getCreatedBookingResponse = await app
      .get(`/api/bookings?user=${normalUserEmail}`)
      .set('bearer', normalUserEmail);
    expect(getCreatedBookingResponse.body).toContainEqual(createResponse.body);

    const deleteResponse = await app
      .delete(`/api/bookings/${createResponse.body.id}`)
      .set('bearer', normalUserEmail);
    expect(deleteResponse.status).toBe(204);

    const getOfficeBookingsResponse = await app.get(`/api/offices`).set('bearer', normalUserEmail);
    const officeData = getOfficeBookingsResponse.body.find((item: any) => item.name === office);
    const slot = officeData.slots.find((item: any) => item.date === date);
    expect(slot.booked).toEqual(0);
  });

  test('can create booking with parking and successfully increase booking count and parking count', async () => {
    const office = officeQuotas[0].name;
    const date = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const createBookingBody = {
      user: normalUserEmail,
      office,
      date,
      parking: true,
    };
    const createResponse = await app
      .post('/api/bookings')
      .send(createBookingBody)
      .set('bearer', normalUserEmail);

    expect(createResponse.ok).toBe(true);

    const getCreatedBookingResponse = await app
      .get(`/api/bookings?user=${normalUserEmail}`)
      .set('bearer', normalUserEmail);
    expect(getCreatedBookingResponse.body).toContainEqual(createResponse.body);

    const getOfficeBookingsResponse = await app.get(`/api/offices`).set('bearer', normalUserEmail);
    const officeData = getOfficeBookingsResponse.body.find((item: any) => item.name === office);
    const slot = officeData.slots.find((item: any) => item.date === date);
    expect(slot.booked).toEqual(1);
    expect(slot.bookedParking).toEqual(1);

    const deleteResponse = await app
      .delete(`/api/bookings/${createResponse.body.id}`)
      .set('bearer', normalUserEmail);
    expect(deleteResponse.status).toBe(204);
  });

  test('can delete booking with parking and successfully increase booking count and parking count', async () => {
    const office = officeQuotas[0].name;
    const date = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const createBookingBody = {
      user: normalUserEmail,
      office,
      date,
      parking: true,
    };
    const createResponse = await app
      .post('/api/bookings')
      .send(createBookingBody)
      .set('bearer', normalUserEmail);

    expect(createResponse.ok).toBe(true);

    const getCreatedBookingResponse = await app
      .get(`/api/bookings?user=${normalUserEmail}`)
      .set('bearer', normalUserEmail);
    expect(getCreatedBookingResponse.body).toContainEqual(createResponse.body);

    const deleteResponse = await app
      .delete(`/api/bookings/${createResponse.body.id}`)
      .set('bearer', normalUserEmail);
    expect(deleteResponse.status).toBe(204);

    const getOfficeBookingsResponse = await app.get(`/api/offices`).set('bearer', normalUserEmail);
    const officeData = getOfficeBookingsResponse.body.find((item: any) => item.name === office);
    const slot = officeData.slots.find((item: any) => item.date === date);
    expect(slot.booked).toEqual(0);
    expect(slot.bookedParking).toEqual(0);
  });

  test('cannot exceed quota', async () => {
    const office = officeQuotas[0].name;
    const date = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const createBookingBody = {
      user: normalUserEmail,
      office,
      date,
      parking: true,
    };
    const createResponse = await app
      .post('/api/bookings')
      .send(createBookingBody)
      .set('bearer', normalUserEmail);

    expect(createResponse.ok).toBe(true);

    const createSecondResponse = await app
      .post('/api/bookings')
      .send({ ...createBookingBody, date: format(addDays(new Date(date), 1), 'yyyy-MM-dd') })
      .set('bearer', normalUserEmail);
    expect(createSecondResponse.status).toEqual(409);
    expect(createSecondResponse.body.message).toEqual('User quota exceeded');
  });
});
