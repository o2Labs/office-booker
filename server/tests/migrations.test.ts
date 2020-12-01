import { configureServer } from './test-utils';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { DynamoDB } from 'aws-sdk';
import { UserBookingsModel } from '../db/userBookings';
import { fixTtl } from '../migrations/4-fix-ttl';
import { BookingsModel } from '../db/bookings';
import { OfficeBookingModel } from '../db/officeBookings';

const { resetDb, config } = configureServer('migrations');

beforeEach(resetDb);

describe('4 - fix TTL', async () => {
  it(`fixes bookings ttl`, async () => {
    const expires = new Date('2020-03-01');
    const mapper = new DataMapper({
      client: new DynamoDB(config.dynamoDB),
      tableNamePrefix: config.dynamoDBTablePrefix,
    });

    const userBookingKey = {
      email: 'user.name@domain.test',
      weekCommencing: '2020-01-01',
    };
    const officeBookingKey = {
      name: 'the-office',
      date: '2020-01-01',
    };
    const bookingKey = {
      id: 'booking-id',
      user: 'user.name@domain.test',
    };
    await mapper.put(
      Object.assign(new UserBookingsModel(), userBookingKey, {
        bookingCount: 1,
        ttl: expires.getTime(),
      })
    );
    await mapper.put(
      Object.assign(new OfficeBookingModel(), officeBookingKey, {
        bookingCount: 1,
        parkingCount: 0,
        ttl: expires.getTime(),
      })
    );
    await mapper.put(
      Object.assign(new BookingsModel(), bookingKey, {
        date: '2020-01-01',
        officeId: 'the-office',
        parking: false,
        ttl: expires.getTime(),
      })
    );

    await fixTtl(config);

    const updatedUserBooking = await mapper.get(
      Object.assign(new UserBookingsModel(), userBookingKey)
    );
    expect(updatedUserBooking.ttl).toBe(Math.floor(expires.getTime() / 1000));

    const updatedOfficeBooking = await mapper.get(
      Object.assign(new OfficeBookingModel(), officeBookingKey)
    );
    expect(updatedOfficeBooking.ttl).toBe(Math.floor(expires.getTime() / 1000));

    const updatedBooking = await mapper.get(Object.assign(new BookingsModel(), bookingKey));
    expect(updatedBooking.ttl).toBe(Math.floor(expires.getTime() / 1000));
  });
});
