import DynamoDB from 'aws-sdk/clients/dynamodb';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { OfficeBookingModel } from '../db/officeBookings';
import { UserBookingsModel } from '../db/userBookings';
import { BookingsModel } from '../db/bookings';
import { UserModel } from '../db/users';

async function createTable() {
  const dynamo = new DynamoDB({
    region: 'eu-west-1',
    endpoint: 'http://localhost:8000',
  });

  const mapper = new DataMapper({
    client: dynamo, // the SDK client used to execute operations
  });
  await mapper.ensureTableExists(OfficeBookingModel, {
    readCapacityUnits: 1,
    writeCapacityUnits: 1,
  });
  await mapper.ensureTableExists(UserBookingsModel, {
    readCapacityUnits: 1,
    writeCapacityUnits: 1,
  });
  await mapper.ensureTableExists(BookingsModel, {
    readCapacityUnits: 1,
    writeCapacityUnits: 1,
    indexOptions: {
      'office-date-bookings': {
        type: 'global',
        projection: 'all',
        readCapacityUnits: 1,
        writeCapacityUnits: 1,
      },
    },
  });
  await mapper.ensureTableExists(UserModel, {
    readCapacityUnits: 1,
    writeCapacityUnits: 1,
  });
}

createTable().catch((e) => {
  console.error(e);
  process.exit(1);
});
