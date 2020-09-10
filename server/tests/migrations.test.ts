import { configureServer, getNormalUser } from './test-utils';
import { format, startOfWeek, addWeeks } from 'date-fns';
import { duplicateOfficeBooking } from '../migrations/2-replace-office-booking-ids';
import { getOfficeBookings } from '../db/officeBookings';

const { app, resetDb, config } = configureServer('migrations');

const nextMonday = startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 });
beforeEach(resetDb);

describe('Office Bookings ID Migration', async () => {
  it('Duplicates current bookings with ID ', async () => {
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
    await duplicateOfficeBooking(config);

    const getCreatedBookingResponse = await app
      .get(`/api/bookings?user=${normalUserEmail}`)
      .set('bearer', normalUserEmail);
    expect(getCreatedBookingResponse.body).toContainEqual(createResponse.body);

    const officeBookingById = await getOfficeBookings(config, office.id, [date]);
    expect(officeBookingById[0]).toMatchObject({
      name: office.id,
      date,
      bookingCount: 1,
      parkingCount: 0,
    });
  });
});
