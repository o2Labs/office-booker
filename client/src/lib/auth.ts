import Auth from '@aws-amplify/auth';
import { CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';

import { User } from '../types/api';
import { Config } from '../context/stores';

const mockSetupLocalStorageKey = 'mock-auth';
let mockSetup: undefined | { auth?: { username: string; code: string } } = undefined;

export const configureAuth = (config: Config) => {
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

// Helpers
const intToHex = (nr: number) => nr.toString(16).padStart(2, '0');

const getRandomString = (bytes: number) => {
  const randomValues = new Uint8Array(bytes);

  window.crypto.getRandomValues(randomValues);

  return Array.from(randomValues).map(intToHex).join('');
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
  const session = await Auth.currentSession();
  const accessToken = session.getIdToken();
  return accessToken.getJwtToken();
};

export const getAuthorization = async () => {
  if (mockSetup !== undefined) {
    if (mockSetup.auth === undefined) return undefined;
    const credentials = `${mockSetup.auth.username}:${mockSetup.auth.code}`;
    return `Basic ${btoa(credentials)}`;
  }
  const token = await getJwtToken();

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
  if (mockSetup !== undefined) {
    return new CognitoUser({
      Username: emailLowered,
      Pool: new CognitoUserPool({ ClientId: 'client-id', UserPoolId: 'us-east-1_user-pool-id' }),
    });
  }
  // Ignoring the "catch" as the response may be that the user
  // already exists, so we want to continue regardless
  try {
    await Auth.signUp({
      username: emailLowered,
      password: getRandomString(20),
    });
    // eslint-disable-next-line no-empty
  } catch {}

  const cognitoUser: CognitoUser = await Auth.signIn(emailLowered);

  return cognitoUser;
};

export const signOut = async () => {
  if (mockSetup !== undefined) {
    mockSetup = {};
    localStorage.removeItem(mockSetupLocalStorageKey);
    return;
  }
  await Auth.signOut();
};
