import { Config } from '../app-config';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { ensureUserExists } from '../db/users';
import { randomBytes } from 'crypto';

export type RegisterBody = {
  action: 'Register';
  email: string;
};

export const isRegisterBody = (input: any): input is RegisterBody =>
  typeof input === 'object' && input.action === 'Register' && typeof input.email === 'string';

const getRandomString = (bytes: number) => {
  const randomValues = randomBytes(bytes);
  return randomValues.toString('base64');
};

export const registerUser = async (config: Config, email: string) => {
  if (config.authConfig.type !== 'cognito') {
    return;
  }
  await ensureUserExists(config, {
    email,
    adminOffices: [],
    quota: config.defaultWeeklyQuota,
    created: new Date().toISOString(),
  });

  const cognito = new CognitoIdentityServiceProvider();
  try {
    await cognito
      .adminCreateUser({
        UserPoolId: config.authConfig.cognitoUserPoolId,
        Username: email,
        MessageAction: 'SUPPRESS',
      })
      .promise();
  } catch (err) {
    if (err.code !== 'UsernameExistsException') {
      throw err;
    }
  }
  return;
};
