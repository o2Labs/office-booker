import DynamoDB from 'aws-sdk/clients/dynamodb';
import { Request } from 'express';
import { isValidEmail } from './users/model';
import { assert } from 'console';

type TestAuthConfig = {
  type: 'test';
  validate: (req: Request) => any;
};

type CognitoAuthConfig = {
  type: 'cognito';
  cognitoUserPoolId: string;
  region: string;
};

export type OfficeQuota = { name: string; quota: number };

const isOfficeQuotas = (input: any): input is OfficeQuota[] =>
  Array.isArray(input) &&
  input.every(
    (o) =>
      typeof o === 'object' &&
      o !== null &&
      typeof o.name === 'string' &&
      typeof o.quota === 'number'
  );

export type AppAuthConfig = CognitoAuthConfig | TestAuthConfig;

export type Config = {
  dynamoDB?: DynamoDB.Types.ClientConfiguration;
  dynamoDBTablePrefix?: string;
  authConfig: AppAuthConfig;
  env?: string;
  selfTestKey?: string;
  selfTestUser?: string;
  officeQuotas: OfficeQuota[];
  systemAdminEmails: string[];
  validEmailMatch?: RegExp;
  caseSensitiveEmail?: boolean;
  defaultWeeklyQuota: number;
  advanceBookingDays: number;
};

export const parseConfigFromEnv = (env: typeof process.env): Config => {
  const {
    REGION,
    COGNITO_USER_POOL_ID,
    SYSTEM_ADMIN_EMAILS,
    EMAIL_REGEX,
    OFFICE_QUOTAS,
    DEFAULT_WEEKLY_QUOTA,
    ADVANCE_BOOKING_DAYS,
  } = env;

  if (
    typeof REGION !== 'string' ||
    typeof COGNITO_USER_POOL_ID !== 'string' ||
    typeof SYSTEM_ADMIN_EMAILS !== 'string' ||
    typeof OFFICE_QUOTAS !== 'string' ||
    typeof DEFAULT_WEEKLY_QUOTA !== 'string' ||
    typeof ADVANCE_BOOKING_DAYS !== 'string'
  ) {
    throw new Error(
      'Missing required env parameters: REGION, COGNITO_USER_POOL_ID, SYSTEM_ADMIN_EMAILS, OFFICE_QUOTAS, DEFAULT_WEEKLY_QUOTA'
    );
  }
  const systemAdminEmails = SYSTEM_ADMIN_EMAILS.split(';');
  if (!systemAdminEmails.every(isValidEmail)) {
    throw new Error('Invalid email addresses in SYSTEM_ADMIN_EMAILS');
  }
  const officeQuotas = JSON.parse(OFFICE_QUOTAS);
  if (!isOfficeQuotas(officeQuotas)) {
    throw new Error('Invalid office quotas in OFFICE_QUOTAS');
  }
  const defaultWeeklyQuota = Number.parseInt(DEFAULT_WEEKLY_QUOTA);
  assert(defaultWeeklyQuota >= 0, `DEFAULT_WEEKLY_QUOTA must be >= 0`);
  const advanceBookingDays = Number.parseInt(ADVANCE_BOOKING_DAYS);
  assert(advanceBookingDays >= 0, `ADVANCE_BOOKING_DAYS must be >= 0`);
  return {
    dynamoDBTablePrefix: env.DYNAMODB_PREFIX,
    authConfig: {
      type: 'cognito',
      cognitoUserPoolId: COGNITO_USER_POOL_ID,
      region: REGION,
    },
    env: env.ENV,
    selfTestKey: env.SELFTESTKEY,
    selfTestUser: env.SELFTESTUSER,
    officeQuotas,
    systemAdminEmails: systemAdminEmails,
    validEmailMatch: EMAIL_REGEX ? new RegExp(EMAIL_REGEX) : undefined,
    caseSensitiveEmail: env.CASE_SENSITIVE_EMAIL?.toLowerCase() === 'true',
    defaultWeeklyQuota,
    advanceBookingDays,
  };
};
