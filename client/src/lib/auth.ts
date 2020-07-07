import Auth from '@aws-amplify/auth';
import { CognitoUser } from 'amazon-cognito-identity-js';

import { User } from '../types/api';

const AUTH_REGION = process.env.REACT_APP_AUTH_REGION;
const AUTH_USER_POOL_ID = process.env.REACT_APP_AUTH_USER_POOL_ID;
const AUTH_WEB_CLIENT_ID = process.env.REACT_APP_AUTH_WEB_CLIENT_ID;

Auth.configure({
  region: AUTH_REGION,
  userPoolId: AUTH_USER_POOL_ID,
  userPoolWebClientId: AUTH_WEB_CLIENT_ID,
});

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
  const session = await tryGetCurrentSession();

  if (session === undefined) {
    return undefined;
  }

  const accessToken = session.getIdToken();

  return accessToken.payload.email;
};

export const getJwtToken = async () => {
  const session = await Auth.currentSession();
  const accessToken = session.getIdToken();

  return accessToken.getJwtToken();
};

export const verifyCode = async (
  cognitoUser: CognitoUser,
  verificationCode: string
): Promise<boolean> => {
  // Retrieve AWS user
  const user: CognitoUser = await Auth.sendCustomChallengeAnswer(cognitoUser, verificationCode);

  return user.getSignInUserSession() !== null;
};

export const signIn = async (email: string) => {
  // Ignoring the "catch" as the response may be that the user
  // already exists, so we want to continue regardless
  try {
    await Auth.signUp({
      username: email,
      password: getRandomString(20),
    });
    // eslint-disable-next-line no-empty
  } catch {}

  const cognitoUser: CognitoUser = await Auth.signIn(email);

  return cognitoUser;
};

export const signOut = async () => {
  await Auth.signOut();
};
