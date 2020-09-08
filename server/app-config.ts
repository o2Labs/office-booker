import DynamoDB from 'aws-sdk/clients/dynamodb';
import { Request } from 'express';
import { isValidEmail } from './users/model';
import { assert } from 'console';
import { getOfficeId, isValidOfficeId } from './getOffices';
import { Arrays } from 'collection-fns';

type TestAuthConfig = {
  type: 'test';
  validate: (req: Request) => any;
};

type CognitoAuthConfig = {
  type: 'cognito';
  cognitoUserPoolId: string;
  cognitoClientId: string;
  region: string;
};

type OfficeQuotaConfig = { id?: string; name: string; quota: number; parkingQuota?: number };
export type OfficeQuota = Required<OfficeQuotaConfig>;

const isOfficeQuotaConfigs = (input: any): input is OfficeQuotaConfig[] =>
  Array.isArray(input) &&
  input.every(
    (o) =>
      typeof o === 'object' &&
      o !== null &&
      typeof o.name === 'string' &&
      typeof o.quota === 'number' &&
      (typeof o.id === 'undefined' || typeof o.id === 'string') &&
      (typeof o.parkingQuota === 'undefined' || typeof o.parkingQuota === 'number')
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
  dataRetentionDays: number;
  showTestBanner: boolean;
  readonly?: boolean;
};

const parseOfficeQuotas = (OFFICE_QUOTAS: string) => {
  const officeQuotaConfigs = JSON.parse(OFFICE_QUOTAS);
  if (!isOfficeQuotaConfigs(officeQuotaConfigs)) {
    throw new Error('Invalid office quotas in OFFICE_QUOTAS');
  }
  const officeQuotas = officeQuotaConfigs.map((o) => ({
    ...o,
    id: o.id ?? getOfficeId(o.name),
    parkingQuota: o.parkingQuota ?? 0,
  }));
  const invalidIds = officeQuotas.map((o) => o.id).filter((id) => !isValidOfficeId(id));
  if (invalidIds.length > 0) {
    throw new Error(`Invalid office ids: ${invalidIds.join(' ')}`);
  }
  const duplicateOfficeIdentifiers = Arrays.groupBy(officeQuotas, (o) => o.id).filter(
    ([key, offices]) => offices.length > 1
  );
  if (duplicateOfficeIdentifiers.length > 0) {
    throw new Error(
      `Duplicate office identifiers: ${duplicateOfficeIdentifiers.map(([id]) => id)}`
    );
  }
  return officeQuotas;
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
    DATA_RETENTION_DAYS,
    COGNITO_CLIENT_ID,
  } = env;

  const requiredEnv = {
    REGION,
    COGNITO_USER_POOL_ID,
    SYSTEM_ADMIN_EMAILS,
    EMAIL_REGEX,
    OFFICE_QUOTAS,
    DEFAULT_WEEKLY_QUOTA,
    ADVANCE_BOOKING_DAYS,
    DATA_RETENTION_DAYS,
    COGNITO_CLIENT_ID,
  };

  if (
    REGION === undefined ||
    COGNITO_USER_POOL_ID === undefined ||
    SYSTEM_ADMIN_EMAILS === undefined ||
    EMAIL_REGEX === undefined ||
    OFFICE_QUOTAS === undefined ||
    EMAIL_REGEX === undefined ||
    DEFAULT_WEEKLY_QUOTA === undefined ||
    ADVANCE_BOOKING_DAYS === undefined ||
    DATA_RETENTION_DAYS === undefined ||
    COGNITO_CLIENT_ID === undefined
  ) {
    const missingEnvVars = Object.entries(requiredEnv)
      .filter(([, val]) => val === undefined)
      .map(([envVar]) => envVar);

    throw new Error(`Missing required env parameters: ${missingEnvVars.join(', ')}`);
  }

  const systemAdminEmails = SYSTEM_ADMIN_EMAILS.split(';');
  if (!systemAdminEmails.every(isValidEmail)) {
    throw new Error('Invalid email addresses in SYSTEM_ADMIN_EMAILS');
  }
  const officeQuotaConfigs = parseOfficeQuotas(OFFICE_QUOTAS);
  const defaultWeeklyQuota = Number.parseInt(DEFAULT_WEEKLY_QUOTA);
  assert(defaultWeeklyQuota >= 0, `DEFAULT_WEEKLY_QUOTA must be >= 0`);
  const advanceBookingDays = Number.parseInt(ADVANCE_BOOKING_DAYS);
  assert(advanceBookingDays >= 0, `ADVANCE_BOOKING_DAYS must be >= 0`);
  const dataRetentionDays = Number.parseInt(DATA_RETENTION_DAYS);
  assert(dataRetentionDays >= 0, `DATA_RETENTION_DAYS must be >= 0`);
  return {
    dynamoDBTablePrefix: env.DYNAMODB_PREFIX,
    authConfig: {
      type: 'cognito',
      cognitoUserPoolId: COGNITO_USER_POOL_ID,
      cognitoClientId: COGNITO_CLIENT_ID,
      region: REGION,
    },
    env: env.ENV,
    selfTestKey: env.SELFTESTKEY,
    selfTestUser: env.SELFTESTUSER,
    officeQuotas: officeQuotaConfigs,
    systemAdminEmails: systemAdminEmails,
    validEmailMatch: EMAIL_REGEX ? new RegExp(EMAIL_REGEX) : undefined,
    caseSensitiveEmail: env.CASE_SENSITIVE_EMAIL?.toLowerCase() === 'true',
    defaultWeeklyQuota,
    advanceBookingDays,
    dataRetentionDays,
    showTestBanner: env.SHOW_TEST_BANNER === 'true',
    readonly: env.READONLY === 'true',
  };
};
