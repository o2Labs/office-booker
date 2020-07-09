import request, { Response } from 'supertest';
import { configureApp } from '../app';
import { Config, OfficeQuota } from '../app-config';
import { createLocalTables } from '../scripts/create-dynamo-tables';

export const normalUserEmail = 'normal.user@office-booker.test';
export const adminUserEmail = 'office-booker-admin-test@office-booker.test';
export const otherUser = 'other.user@office-booker.test';
export const officeQuotas: OfficeQuota[] = [
  {
    id: 'office-a',
    name: 'Office A',
    quota: 100,
    parkingQuota: 50,
  },
  {
    id: 'office-b',
    name: 'Office B',
    quota: 200,
    parkingQuota: 0,
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
  await createLocalTables(
    { deleteTablesFirst: true },
    {
      region: 'eu-west-1',
      endpoint: 'http://localhost:8000',
    }
  );
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
