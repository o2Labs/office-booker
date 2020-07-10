import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import { ServerlessWebStack } from './serverlessWebStack';
import { createAuthChallengeHandler } from './cognito/createAuthChallenge';
import { defineAuthChallengeHandler } from './cognito/defineAuthChallenge';
import { preSignUpHandler } from './cognito/preSignUp';
import { verifyAuthChallengeResponseHandler } from './cognito/verifyAuthChallengeResponse';

const config = new pulumi.Config();

const stackName = pulumi.getStack();
const serviceName = `${config.name}-${stackName}`;
const tags = {
  Stack: serviceName,
};

// All stack configuration options
const logRetention = config.getNumber('log-retention', { min: 0 }) ?? 30;
const registrationFromAddress = config.require('registration-from-address');
const domainName = config.require('domain-name');
const advanceBookingDays = config.requireNumber('advance-booking-days', { min: 0 });
const defaultWeeklyQuota = config.requireNumber('default-weekly-quota', { min: 0 });
const selfTestKey = config.requireSecret('selftest-key');
const selfTestUser = config.require('selftest-user');
const caseSensitiveEmail = config.getBoolean('case-sensitive-email') ?? false;
const dnsZone = config.require('dns-zone');
export const systemAdminEmails = config.requireObject<string[]>('system-admin-emails').join(';');
export const officeQuotas = JSON.stringify(
  config.requireObject<{ name: string; quota: number }[]>('office-quotas')
);
export const emailRegex = (() => {
  const emailRegex = config.require('email-regex');
  new RegExp(emailRegex).compile();
  return emailRegex;
})();

// Auth Challenge
const createAuthChallenge = new aws.lambda.CallbackFunction(
  `${serviceName}-create-auth-challenge`,
  {
    callback: createAuthChallengeHandler,
    policies: [
      'arn:aws:iam::aws:policy/AWSLambdaFullAccess',
      'arn:aws:iam::aws:policy/AmazonSESFullAccess',
    ],
    memorySize: 512,
    timeout: 5,
    runtime: 'nodejs12.x',
    tags,
    environment: {
      variables: {
        FROM_ADDRESS: registrationFromAddress,
        DOMAIN: domainName,
      },
    },
  }
);
const authLogGroup = new aws.cloudwatch.LogGroup(`${serviceName}-createAuthChallenge-log-group`, {
  name: createAuthChallenge.name.apply((name) => `/aws/lambda/${name}`),
  retentionInDays: logRetention,
});
new aws.lambda.Permission(`${serviceName}-create-auth-challenge-permission`, {
  action: 'lambda:InvokeFunction',
  function: createAuthChallenge.arn,
  principal: 'cognito-idp.amazonaws.com',
});

const defineAuthChallenge = new aws.lambda.CallbackFunction(
  `${serviceName}-define-auth-challenge`,
  {
    callback: defineAuthChallengeHandler,
    memorySize: 512,
    timeout: 5,
    runtime: 'nodejs12.x',
    environment: {
      variables: {
        EMAIL_REGEX: emailRegex,
      },
    },
    tags,
  }
);
new aws.cloudwatch.LogGroup(`${serviceName}-defineAuthChallenge-log-group`, {
  name: defineAuthChallenge.name.apply((name) => `/aws/lambda/${name}`),
  retentionInDays: logRetention,
});
new aws.lambda.Permission(`${serviceName}-define-auth-challengepermission`, {
  action: 'lambda:InvokeFunction',
  function: defineAuthChallenge.arn,
  principal: 'cognito-idp.amazonaws.com',
});

// Pre sign up
const preSignUp = new aws.lambda.CallbackFunction(`${serviceName}-pre-sign-up`, {
  callback: preSignUpHandler,
  memorySize: 512,
  timeout: 5,
  runtime: 'nodejs12.x',
  tags,
});
new aws.cloudwatch.LogGroup(`${serviceName}-preSignUp-log-group`, {
  name: preSignUp.name.apply((name) => `/aws/lambda/${name}`),
  retentionInDays: logRetention,
});
new aws.lambda.Permission(`${serviceName}-pre-sign-up-permission`, {
  action: 'lambda:InvokeFunction',
  function: preSignUp.arn,
  principal: 'cognito-idp.amazonaws.com',
});

// Verify auth challenge
const verifyAuthChallengeResponse = new aws.lambda.CallbackFunction(
  `${serviceName}-verify-auth-challenge-response`,
  {
    callback: verifyAuthChallengeResponseHandler,
    memorySize: 512,
    timeout: 5,
    runtime: 'nodejs12.x',
    tags,
  }
);
new aws.cloudwatch.LogGroup(`${serviceName}-verifyAuthChallengeResponse-log-group`, {
  name: verifyAuthChallengeResponse.name.apply((name) => `/aws/lambda/${name}`),
  retentionInDays: logRetention,
});
new aws.lambda.Permission(`${serviceName}-verify-auth-challenge-response-permission`, {
  action: 'lambda:InvokeFunction',
  function: verifyAuthChallengeResponse.arn,
  principal: 'cognito-idp.amazonaws.com',
});

// Users
const userPool = new aws.cognito.UserPool(`${serviceName}-users`, {
  schemas: [
    {
      name: 'email',
      attributeDataType: 'String',
      mutable: true,
      required: true,
      stringAttributeConstraints: {
        maxLength: '2048',
        minLength: '0',
      },
    },
  ],
  passwordPolicy: {
    minimumLength: 8,
    requireLowercase: false,
    requireNumbers: false,
    requireSymbols: false,
    requireUppercase: false,
  },
  usernameAttributes: ['email'],
  mfaConfiguration: 'OFF',
  lambdaConfig: {
    createAuthChallenge: createAuthChallenge.arn,
    defineAuthChallenge: defineAuthChallenge.arn,
    preSignUp: preSignUp.arn,
    verifyAuthChallengeResponse: verifyAuthChallengeResponse.arn,
  },
  tags,
});

const authClient = new aws.cognito.UserPoolClient(`${serviceName}-auth-client`, {
  userPoolId: userPool.id,
});

const dynamoTablePrefix = serviceName + '.';

const userBookingsTable = new aws.dynamodb.Table('user-bookings-table', {
  name: dynamoTablePrefix + 'user-bookings',
  attributes: [
    {
      name: 'email',
      type: 'S',
    },
    {
      name: 'weekCommencing',
      type: 'S',
    },
  ],
  hashKey: 'email',
  rangeKey: 'weekCommencing',
  ttl: {
    attributeName: 'ttl',
    enabled: true,
  },
  billingMode: 'PAY_PER_REQUEST',
  pointInTimeRecovery: {
    enabled: false,
  },
  serverSideEncryption: {
    enabled: true,
  },
  tags,
});

const officeBookingsTable = new aws.dynamodb.Table('office-bookings-table', {
  name: dynamoTablePrefix + 'office-bookings',
  attributes: [
    {
      name: 'name',
      type: 'S',
    },
    {
      name: 'date',
      type: 'S',
    },
  ],
  hashKey: 'name',
  rangeKey: 'date',
  billingMode: 'PAY_PER_REQUEST',
  ttl: {
    attributeName: 'ttl',
    enabled: true,
  },
  pointInTimeRecovery: {
    enabled: false,
  },
  serverSideEncryption: {
    enabled: true,
  },
  tags,
});

const bookingsTable = new aws.dynamodb.Table('bookings-table', {
  name: dynamoTablePrefix + 'bookings',
  attributes: [
    {
      name: 'id',
      type: 'S',
    },
    {
      name: 'user',
      type: 'S',
    },
    {
      name: 'office',
      type: 'S',
    },
    {
      name: 'date',
      type: 'S',
    },
  ],
  hashKey: 'user',
  rangeKey: 'id',
  billingMode: 'PAY_PER_REQUEST',
  globalSecondaryIndexes: [
    {
      name: 'office-date-bookings',
      hashKey: 'office',
      rangeKey: 'date',
      projectionType: 'ALL',
    },
  ],
  pointInTimeRecovery: {
    enabled: false,
  },
  ttl: {
    attributeName: 'ttl',
    enabled: true,
  },
  serverSideEncryption: {
    enabled: true,
  },
  tags,
});

const userTable = new aws.dynamodb.Table('user-table', {
  name: dynamoTablePrefix + 'users',
  attributes: [
    {
      name: 'email',
      type: 'S',
    },
  ],
  hashKey: 'email',
  billingMode: 'PAY_PER_REQUEST',
  pointInTimeRecovery: {
    enabled: false,
  },
  serverSideEncryption: {
    enabled: true,
  },
  tags,
});

const httpRole = new aws.iam.Role(`${serviceName}-lambda-execution-role`, {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'lambda.amazonaws.com',
  }),
  name: `${serviceName}-lambdaRole`,
});

new aws.iam.RolePolicy('lambda-iam-policy', {
  role: httpRole,
  policy: pulumi.output({
    Version: '2012-10-17',
    Statement: [
      {
        Action: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
          'ec2:CreateNetworkInterface',
          'ec2:DescribeNetworkInterfaces',
          'ec2:DeleteNetworkInterface',
        ],
        Resource: '*',
        Effect: 'Allow',
      },
      {
        Effect: 'Allow',
        Action: [
          'dynamodb:BatchGetItem',
          'dynamodb:GetItem',
          'dynamodb:Query',
          'dynamodb:Scan',
          'dynamodb:BatchWriteItem',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
        ],
        Resource: [
          userBookingsTable.arn,
          officeBookingsTable.arn,
          bookingsTable.arn,
          userTable.arn,
          bookingsTable.arn.apply((tableArn) => `${tableArn}/index/office-date-bookings`),
        ],
      },
    ],
  }),
});

const getHttpEnv = (): aws.types.input.lambda.FunctionEnvironment['variables'] => {
  const env: {
    [key: string]: pulumi.Input<string>;
  } = {
    ADVANCE_BOOKING_DAYS: advanceBookingDays.toString(),
    DYNAMODB_PREFIX: dynamoTablePrefix,
    COGNITO_USER_POOL_ID: userPool.id,
    ENV: stackName,
    REGION: aws.getRegion().then((r) => r.name),
    OFFICE_QUOTAS: officeQuotas,
    SELFTESTKEY: selfTestKey,
    SELFTESTUSER: selfTestUser,
    SYSTEM_ADMIN_EMAILS: systemAdminEmails,
    EMAIL_REGEX: emailRegex,
    DEFAULT_WEEKLY_QUOTA: defaultWeeklyQuota.toString(),
    DATA_RETENTION_DAYS: logRetention.toString(),
  };
  if (caseSensitiveEmail) {
    env.CASE_SENSITIVE_EMAIL = 'true';
  }
  return env;
};

const httpHandler = new aws.lambda.Function(`${serviceName}-http`, {
  runtime: 'nodejs12.x',
  memorySize: 512,
  role: httpRole.arn,
  code: new pulumi.asset.AssetArchive({
    '.': new pulumi.asset.FileArchive('../dist/server'),
  }),
  handler: 'lambda.handler',
  environment: {
    variables: getHttpEnv(),
  },
  tags,
});

const httpLogGroupName = httpHandler.name.apply((name) => `/aws/lambda/${name}`);
const httpLogGroup = new aws.cloudwatch.LogGroup(`${serviceName}-http-log-group`, {
  name: httpLogGroupName,
  retentionInDays: logRetention,
});

// Catch errors for alerting
const lambdaAlerts = new aws.lambda.Function(`${serviceName}-alerts`, {
  memorySize: 128,
  runtime: aws.lambda.NodeJS12dXRuntime,
  environment: {
    variables: {
      ENV: stackName,
    },
  },
  code: new pulumi.asset.AssetArchive({
    '.': new pulumi.asset.FileArchive('../dist/alerts'),
  }),
  handler: 'lambda.handler',
  role: httpRole.arn,
  tags,
});
new aws.cloudwatch.LogGroup(`${serviceName}-lambdaAlerts-log-group`, {
  name: lambdaAlerts.name.apply((name) => `/aws/lambda/${name}`),
  retentionInDays: logRetention,
});

const errorLevelFilter = '{ $.level = "ERROR" }';

httpLogGroup.onEvent(`${serviceName}-http-alerting-lambda-log-event`, lambdaAlerts, {
  filterPattern: errorLevelFilter,
});

authLogGroup.onEvent(`${serviceName}-auth-challenge-alerting-lambda-log-event`, lambdaAlerts, {
  filterPattern: errorLevelFilter,
});

const stack = new ServerlessWebStack(`${serviceName}-api`, {
  apiEventHandler: httpHandler,
  compress: true,
  customErrorResponses: [{ errorCode: 404, responseCode: 200, responsePagePath: '/index.html' }],
  s3DefaultEncryption: true,
  cdnLogs: {
    enabled: true,
    encryption: true,
    expiryDays: logRetention,
  },
  defaultTtl: 0,
  customDns: {
    domainName: domainName,
    zoneName: dnsZone,
  },
  tags,
});

export const staticSiteBucket = stack.staticSiteBucket.bucket;
export const cfUrn = stack.cdn.urn;
export const staticSiteUrl = stack.url;
export const cognitoPoolId = userPool.id;
export const cognitoAuthClientId = authClient.id;
