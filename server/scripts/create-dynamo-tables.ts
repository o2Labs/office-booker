import DynamoDB from 'aws-sdk/clients/dynamodb';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { OfficeBookingModel } from '../db/officeBookings';
import { UserBookingsModel } from '../db/userBookings';
import { BookingsModel } from '../db/bookings';
import { BookingsModel as BookingsModelV2 } from '../db/bookingsV2';
import { UserModel } from '../db/users';

export const createLocalTables = async (
  options: { tableNamePrefix?: string; deleteTablesFirst?: boolean },
  config?: DynamoDB.ClientConfiguration
) => {
  const dynamo = new DynamoDB(config);
  const mapper = new DataMapper({ client: dynamo, tableNamePrefix: options.tableNamePrefix });
  if (options.deleteTablesFirst) {
    await mapper.ensureTableNotExists(OfficeBookingModel);
    await mapper.ensureTableNotExists(UserBookingsModel);
    await mapper.ensureTableNotExists(BookingsModel);
    await mapper.ensureTableNotExists(BookingsModelV2);
    await mapper.ensureTableNotExists(UserModel);
  }
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
  await mapper.ensureTableExists(BookingsModelV2, {
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
};
