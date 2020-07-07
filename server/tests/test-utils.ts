import { DynamoDB } from 'aws-sdk/clients/all';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { BookingsModel } from '../db/bookings';
import { UserBookingsModel } from '../db/userBookings';
import { OfficeBookingModel } from '../db/officeBookings';
import request, { Response } from 'supertest';
import { configureApp } from '../app';
import { Config, OfficeQuota } from '../app-config';

export const normalUserEmail = 'normal.user@office-booker.test';
export const adminUserEmail = 'office-booker-admin-test@office-booker.test';
export const otherUser = 'other.user@office-booker.test';
export const officeQuotas: OfficeQuota[] = [
  {
    name: 'Office A',
    quota: 100,
  },
  {
    name: 'Office B',
    quota: 200,
  },
];

export const getConfig = (): Config => {
  return {
    authConfig: {
      type: 'test',
      validate: (req) => {
        const email = req.headers.bearer;
        if (!email || !email.toString().endsWith('@office-booker.test')) {
          return Error('Invalid Id');
        }
        return { email: email };
      },
    },
    dynamoDB: {
      region: 'eu-west-1',
      endpoint: 'http://localhost:8000',
    },
    env: 'test',
    officeQuotas,
    systemAdminEmails: [adminUserEmail],
    defaultWeeklyQuota: 1,
    advanceBookingDays: 14,
  };
};

export const server = () => {
  return request(configureApp(getConfig()));
};

export const resetDb = async () => {
  const dynamo = new DynamoDB({
    region: 'eu-west-1',
    endpoint: 'http://localhost:8000',
  });

  const mapper = new DataMapper({
    client: dynamo,
  });
  await mapper.ensureTableNotExists(OfficeBookingModel);
  await mapper.ensureTableNotExists(UserBookingsModel);
  await mapper.ensureTableNotExists(BookingsModel);
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
  });
};

export const expectUnauthorised = (response: Response) => {
  expect(response.status).toBe(401);
  expect(response.body).toMatchObject({
    message: 'Unauthorised',
  });
  expect(Object.keys(response.body)).toEqual(['message', 'reference', 'error']);
};

export const expectForbidden = (response: Response) => {
  expect(response.status).toBe(403);
  expect(response.body).toMatchObject({
    message: 'Forbidden',
  });
  expect(Object.keys(response.body)).toEqual(['message', 'reference', 'error']);
};
