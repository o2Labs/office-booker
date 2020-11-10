import Auth from '@aws-amplify/auth';
import { CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';

import { User } from '../types/api';
import { Config } from '../context/stores';
import { registerUser } from './api';

const mockSetupLocalStorageKey = 'mock-auth';
let mockSetup: undefined | { auth?: { username: string; code: string } } = undefined;

export const configureAuth = (config: Config): void => {
  if (config.auth.type === 'cognito') {
    Auth.configure({
      region: config.auth.region,
      userPoolId: config.auth.userPoolId,
      userPoolWebClientId: config.auth.webClientId,
    });
  } else {
    try {
      const localState = localStorage.getItem(mockSetupLocalStorageKey);
      mockSetup = localState === null ? {} : JSON.parse(localState);
    } catch {
      mockSetup = {};
    }
  }
};

const tryGetCurrentSession = async () => {
  try {
    return await Auth.currentSession();
  } catch (err) {
    return undefined;
  }
};

// Exports
export const getAuthState = async (): Promise<User['email'] | undefined> => {
  // Check for current session
  if (mockSetup !== undefined) {
    return mockSetup.auth?.username;
  }
  const session = await tryGetCurrentSession();

  if (session === undefined) {
    return undefined;
  }

  const accessToken = session.getIdToken();

  return accessToken.payload.email;
};

const getJwtToken = async () => {
  const session = await tryGetCurrentSession();
  if (session === undefined) {
    return undefined;
  }
  const accessToken = session.getIdToken();
  return accessToken.getJwtToken();
};

export const getAuthorization = async (): Promise<string | undefined> => {
  if (mockSetup !== undefined) {
    if (mockSetup.auth === undefined) return undefined;
    const credentials = `${mockSetup.auth.username}:${mockSetup.auth.code}`;
    return `Basic ${btoa(credentials)}`;
  }
  const token = await getJwtToken();
  if (token === undefined) {
    return undefined;
  }

  return `Bearer ${token}`;
};

export const verifyCode = async (
  cognitoUser: CognitoUser,
  verificationCode: string
): Promise<boolean> => {
  if (mockSetup !== undefined) {
    mockSetup.auth = { username: cognitoUser.getUsername(), code: verificationCode };
    localStorage.setItem(mockSetupLocalStorageKey, JSON.stringify(mockSetup));
    return true;
  }
  // Retrieve AWS user
  const user: CognitoUser = await Auth.sendCustomChallengeAnswer(cognitoUser, verificationCode);

  return user.getSignInUserSession() !== null;
};

export const signIn = async (email: string): Promise<CognitoUser> => {
  const emailLowered = email.toLowerCase();
  await registerUser({ email });
  if (mockSetup !== undefined) {
    return new CognitoUser({
      Username: emailLowered,
      Pool: new CognitoUserPool({ ClientId: 'client-id', UserPoolId: 'us-east-1_user-pool-id' }),
    });
  }

  const cognitoUser: CognitoUser = await Auth.signIn(emailLowered);
  return cognitoUser;
};

export const signOut = async (): Promise<void> => {
  if (mockSetup !== undefined) {
    mockSetup = {};
    localStorage.removeItem(mockSetupLocalStorageKey);
    return;
  }
  await Auth.signOut();
};
