import { format, addDays, startOfWeek, addWeeks } from 'date-fns';
import { configureServer, getNormalUser } from './test-utils';
import { Arrays } from 'collection-fns';

const { app, resetDb, config } = configureServer('bookings', {
  defaultWeeklyQuota: 2,
});

const nextMonday = startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 });

beforeEach(resetDb);

describe('Testing DB logic', async () => {
  test('can create booking and successfully increase booking count', async () => {
    const normalUserEmail = getNormalUser();
    const office = config.officeQuotas[0];
    const date = format(nextMonday, 'yyyy-MM-dd');
    const createBookingBody = {
      user: normalUserEmail,
      office: { id: office.id },
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

    const getOfficeBookingsResponse = await app
      .get(`/api/offices/${office.id}`)
      .set('bearer', normalUserEmail);
    const officeData = getOfficeBookingsResponse.body;
    const slot = officeData.slots.find((item: any) => item.date === date);
    expect(slot.booked).toEqual(1);
    expect(slot.bookedParking).toEqual(0);
  });

  test('can delete booking and successfully decrease booking count', async () => {
    const normalUserEmail = getNormalUser();
    const office = config.officeQuotas[0];
    const date = format(nextMonday, 'yyyy-MM-dd');
    const createBookingBody = {
      user: normalUserEmail,
      office: { id: office.id },
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

    const getOfficeBookingsResponse = await app
      .get(`/api/offices/${office.id}`)
      .set('bearer', normalUserEmail);
    const officeData = getOfficeBookingsResponse.body;
    const slot = officeData.slots.find((item: any) => item.date === date);
    expect(slot.booked).toEqual(0);
  });

  test('can create booking with parking and successfully increase booking count and parking count', async () => {
    const normalUserEmail = getNormalUser();
    const office = config.officeQuotas[0];
    const date = format(addDays(nextMonday, 1), 'yyyy-MM-dd');
    const createBookingBody = {
      user: normalUserEmail,
      office: { id: office.id },
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

    const getOfficeBookingsResponse = await app
      .get(`/api/offices/${office.id}`)
      .set('bearer', normalUserEmail);
    const officeData = getOfficeBookingsResponse.body;
    const slot = officeData.slots.find((item: any) => item.date === date);
    expect(slot.booked).toEqual(1);
    expect(slot.bookedParking).toEqual(1);
  });

  test('can delete booking with parking and successfully decrease booking count and parking count', async () => {
    const normalUserEmail = getNormalUser();
    const office = config.officeQuotas[0];
    const date = format(addDays(nextMonday, 1), 'yyyy-MM-dd');
    const createBookingBody = {
      user: normalUserEmail,
      office: { id: office.id },
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

    const getOfficeBookingsResponse = await app
      .get(`/api/offices/${office.id}`)
      .set('bearer', normalUserEmail);
    const officeData = getOfficeBookingsResponse.body;
    const slot = officeData.slots.find((item: any) => item.date === date);
    expect(slot.booked).toEqual(0);
    expect(slot.bookedParking).toEqual(0);
  });

  test('cannot have multiple bookings on the same day', async () => {
    const normalUserEmail = getNormalUser();
    const date = format(addDays(nextMonday, 1), 'yyyy-MM-dd');
    const createBookingBody = {
      user: normalUserEmail,
      office: { id: config.officeQuotas[0].id },
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
      .send(createBookingBody)
      .set('bearer', normalUserEmail);
    expect(createSecondResponse.status).toEqual(409);
    expect(createSecondResponse.body.message).toEqual(`Can't have multiple bookings per day`);
  });

  test('cannot exceed weekly quota', async () => {
    const normalUserEmail = getNormalUser();
    const createBookingBody = {
      user: normalUserEmail,
      office: { id: config.officeQuotas[0].id },
      parking: true,
    };

    const days = Arrays.init({ from: 1, to: config.defaultWeeklyQuota });

    for (const day of days) {
      const res = await app
        .post('/api/bookings')
        .send({ ...createBookingBody, date: format(addDays(nextMonday, day), 'yyyy-MM-dd') })
        .set('bearer', normalUserEmail);
      expect(res.ok).toBe(true);
    }

    const createThirdResponse = await app
      .post('/api/bookings')
      .send({
        ...createBookingBody,
        date: format(addDays(nextMonday, config.defaultWeeklyQuota + 1), 'yyyy-MM-dd'),
      })
      .set('bearer', normalUserEmail);

    expect(createThirdResponse.status).toEqual(409);
    expect(createThirdResponse.body.message).toEqual('User quota exceeded');
  });

  test('booking failing due to lack of parking', async () => {
    const normalUserEmail = getNormalUser();
    const createBookingBody = {
      user: normalUserEmail,
      office: { id: config.officeQuotas[1].id },
      parking: true,
    };

    const response = await app
      .post('/api/bookings')
      .send({
        ...createBookingBody,
        date: format(addDays(nextMonday, config.defaultWeeklyQuota + 1), 'yyyy-MM-dd'),
      })
      .set('bearer', normalUserEmail);

    expect(response.status).toEqual(409);
    expect(response.body.message).toEqual('Office parking quota exceeded');
  });

  test('can create booking with reason provided and successfully increase booking count and email sent', async () => {
    config.reasonToBookRequired = true;
    config.notificationToAddress = 'notifications@domain.test';
    config.fromAddress = 'office@domain.test';
    const normalUserEmail = getNormalUser();
    const office = config.officeQuotas[0];
    const date = format(addDays(nextMonday, 1), 'yyyy-MM-dd');
    const createBookingBody = {
      user: normalUserEmail,
      office: { id: office.id },
      date,
      reasonToBook: 'strong reason to attend',
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

    const getOfficeBookingsResponse = await app
      .get(`/api/offices/${office.id}`)
      .set('bearer', normalUserEmail);
    const officeData = getOfficeBookingsResponse.body;
    const slot = officeData.slots.find((item: any) => item.date === date);
    expect(slot.booked).toEqual(1);
  });

  test('unable to create booking with missing env parameters', async () => {
    config.reasonToBookRequired = true;
    config.fromAddress = 'office@domain.test';
    const normalUserEmail = getNormalUser();
    const office = config.officeQuotas[0];
    const date = format(addDays(nextMonday, 1), 'yyyy-MM-dd');
    const createBookingBody = {
      user: normalUserEmail,
      office: { id: office.id },
      date,
    };
    const createResponse = await app
      .post('/api/bookings')
      .send(createBookingBody)
      .set('bearer', normalUserEmail);

    expect(createResponse.ok).toBe(false);

    const getOfficeBookingsResponse = await app
      .get(`/api/offices/${office.id}`)
      .set('bearer', normalUserEmail);
    const officeData = getOfficeBookingsResponse.body;
    const slot = officeData.slots.find((item: any) => item.date === date);
    expect(slot.booked).toEqual(0);
  });

  test('unable to create booking with no reason provided', async () => {
    config.reasonToBookRequired = true;
    config.notificationToAddress = 'notifications@domain.test';
    config.fromAddress = 'office@domain.test';
    const normalUserEmail = getNormalUser();
    const office = config.officeQuotas[0];
    const date = format(addDays(nextMonday, 1), 'yyyy-MM-dd');
    const createBookingBody = {
      user: normalUserEmail,
      office: { id: office.id },
      date,
    };
    const createResponse = await app
      .post('/api/bookings')
      .send(createBookingBody)
      .set('bearer', normalUserEmail);

    expect(createResponse.ok).toBe(false);

    const getOfficeBookingsResponse = await app
      .get(`/api/offices/${office.id}`)
      .set('bearer', normalUserEmail);
    const officeData = getOfficeBookingsResponse.body;
    const slot = officeData.slots.find((item: any) => item.date === date);
    expect(slot.booked).toEqual(0);
  });
});

test('can create booking for auto approved user without reason provided and successfully increase booking count and no email sent', async () => {
  config.reasonToBookRequired = true;
  config.notificationToAddress = 'notifications@domain.test';
  config.fromAddress = 'office@domain.test';
  const autoApprovedUserEmail = 'office-booker-auto-approved-test@office-booker.test';

  const office = config.officeQuotas[0];
  const date = format(addDays(nextMonday, 1), 'yyyy-MM-dd');
  const createBookingBody = {
    user: autoApprovedUserEmail,
    office: { id: office.id },
    date,
  };
  const createResponse = await app
    .post('/api/bookings')
    .send(createBookingBody)
    .set('bearer', autoApprovedUserEmail);
  expect(createResponse.ok).toBe(true);

  const getCreatedBookingResponse = await app
    .get(`/api/bookings?user=${autoApprovedUserEmail}`)
    .set('bearer', autoApprovedUserEmail);
  expect(getCreatedBookingResponse.body).toContainEqual(createResponse.body);

  const getOfficeBookingsResponse = await app
    .get(`/api/offices/${office.id}`)
    .set('bearer', autoApprovedUserEmail);
  const officeData = getOfficeBookingsResponse.body;
  const slot = officeData.slots.find((item: any) => item.date === date);
  expect(slot.booked).toEqual(1);
});
