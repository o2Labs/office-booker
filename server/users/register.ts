import { Config } from '../app-config';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { ensureUserExists } from '../db/users';

export type RegisterBody = {
  action: 'Register';
  email: string;
};

export const isRegisterBody = (input: any): input is RegisterBody =>
  typeof input === 'object' && input.action === 'Register' && typeof input.email === 'string';

const intToHex = (nr: number) => nr.toString(16).padStart(2, '0');

const getRandomString = (bytes: number) => {
  const randomValues = new Uint8Array(bytes);

  crypto.getRandomValues(randomValues);

  return Array.from(randomValues).map(intToHex).join('');
};

export const registerUser = async (config: Config, email: string) => {
  if (config.authConfig.type !== 'cognito') {
    return;
  }
  await ensureUserExists(config, {
    email,
    adminOffices: [],
    quota: config.defaultWeeklyQuota,
  });

  const cognito = new CognitoIdentityServiceProvider();
  await cognito
    .adminCreateUser({
      UserPoolId: config.authConfig.cognitoUserPoolId,
      Username: email,
      MessageAction: 'SUPPRESS',
    })
    .promise();
  // Get rid of temporary password.
  await cognito
    .adminSetUserPassword({
      UserPoolId: config.authConfig.cognitoUserPoolId,
      Username: email,
      Password: getRandomString(20),
      Permanent: true,
    })
    .promise();
  return;
};
