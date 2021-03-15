import request, { Response } from 'supertest';
import { configureApp } from '../app';
import { Config, OfficeQuota } from '../app-config';
import { createLocalTables } from '../scripts/create-dynamo-tables';
import { randomBytes } from 'crypto';
import { UserType } from 'aws-sdk/clients/cognitoidentityserviceprovider';

export const adminUserEmail = 'office-booker-admin-test@office-booker.test';
export const autoApprovedUserEmail = 'office-booker-auto-approved-test@office-booker.test'

export const getNormalUser = () => `${randomBytes(10).toString('hex')}@office-booker.test`;

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

type TestConfig = Partial<
  Pick<Config, 'officeQuotas' | 'systemAdminEmails' | 'defaultWeeklyQuota' >
> & { users?: UserType[] };

export const getConfig = (dynamoDBTablePrefix: string, testConfig?: TestConfig): Config => {
  return {
    dynamoDBTablePrefix: (dynamoDBTablePrefix ?? 'test') + '.',
    authConfig: {
      type: 'test',
      validate: (req) => {
        const email = req.headers.bearer;
        if (!email || !email.toString().endsWith('@office-booker.test')) {
          return Error('Invalid Id');
        }
        return { email: email };
      },
      users: testConfig?.users ?? [],
    },
    dynamoDB: {
      region: 'eu-west-1',
      endpoint: 'http://localhost:8000',
    },
    env: 'test',
    officeQuotas: testConfig?.officeQuotas ?? officeQuotas,
    systemAdminEmails: testConfig?.systemAdminEmails ?? [adminUserEmail],
    autoApprovedEmails: [autoApprovedUserEmail],
    defaultWeeklyQuota: testConfig?.defaultWeeklyQuota ?? 1,
    advanceBookingDays: 14,
    dataRetentionDays: 30,
    showTestBanner: true,
    reasonToBookRequired: false,
  };
};

export const configureServer = (dynamoDBTablePrefix: string, testConfig?: TestConfig) => {
  const config = getConfig(dynamoDBTablePrefix, testConfig);
  return {
    app: request(configureApp(config)),
    resetDb: () =>
      createLocalTables(
        { deleteTablesFirst: true, tableNamePrefix: config.dynamoDBTablePrefix },
        config.dynamoDB
      ),
    config,
  };
};

export const expectOk = (response: Response) => {
  if (!response.ok) {
    throw new Error(`Response not okay: ${response.status}\n${response.body}`);
  }
};

export const expectUnauthorized = (response: Response) => {
  expect(response.status).toBe(401);
  expect(response.body).toMatchObject({
    message: 'Unauthorized',
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
