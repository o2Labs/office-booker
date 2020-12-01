import { DataMapper } from '@aws/dynamodb-data-mapper';
import { DynamoDB } from 'aws-sdk';
import { getUnixTime } from 'date-fns';
import { Config } from '../app-config';
import { BookingsModel } from '../db/bookings';
import { OfficeBookingModel } from '../db/officeBookings';
import { UserBookingsModel } from '../db/userBookings';

// Check if TTL is beyond the year 3000
const timestampTooHigh = (ttl: number) => ttl > 32503680000;

async function* getCorrectedTtls(mapper: DataMapper, model: { new (): any }) {
  for await (const booking of mapper.scan(model)) {
    if (timestampTooHigh(booking.ttl)) {
      const ttl = new Date(booking.ttl);
      booking.ttl = getUnixTime(ttl);
      yield booking;
    }
  }
}

const scanAndFix = async (mapper: DataMapper, model: { new (): any }) => {
  let updated = 0;
  for await (const _item of mapper.batchPut(getCorrectedTtls(mapper, model))) {
    updated++;
    if (updated % 100 === 0) {
      console.log('Updated ', updated);
    }
  }
  console.log('Updated ', updated);
};

export const fixTtl = async (config: Config) => {
  const mapper = new DataMapper({
    client: new DynamoDB(config.dynamoDB),
    tableNamePrefix: config.dynamoDBTablePrefix,
  });
  await scanAndFix(mapper, BookingsModel);
  await scanAndFix(mapper, OfficeBookingModel);
  await scanAndFix(mapper, UserBookingsModel);
};
