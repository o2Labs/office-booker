import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import fetch from 'node-fetch';

export type CognitoConfig = {
  userPoolId: string;
  region: string;
  tokenUse: 'access' | 'id';
};

export type Pems = {
  [key: string]: string;
};

export async function loadPems(issuer: string): Promise<Pems> {
  const response = await fetch(`${issuer}/.well-known/jwks.json`);
  if (!response.ok) {
    const body = await response.textConverted();
    throw new Error(
      `Failed fetching jwks.json: ${response.status} ${response.statusText}\n\n${body}`
    );
  }
  const json = await response.json();
  const pems: { [key: string]: string } = {};
  const keys = json['keys'];
  for (let i = 0; i < keys.length; i++) {
    const keyId = keys[i].kid;
    const modulus = keys[i].n;
    const exponent = keys[i].e;
    const keyYype = keys[i].kty;
    const jwk = { kty: keyYype, n: modulus, e: exponent };
    const pem = jwkToPem(jwk);
    pems[keyId] = pem;
  }
  return pems;
}

const pemsCache = new Map<string, Pems>();

const loadPemsCached = async (issuer: string) => {
  const cachedPems = pemsCache.get(issuer);
  if (cachedPems !== undefined) {
    return cachedPems;
  }
  const pems = await loadPems(issuer);
  pemsCache.set(issuer, pems);
  return pems;
};

export type CognitoValidationResult =
  | { valid: true; token: any }
  | { valid: false; reason: string };

export type CognitoValidation = (token: string) => Promise<CognitoValidationResult>;

export const getIssuer = ({ region, userPoolId }: { region: string; userPoolId: string }) =>
  `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

export const validate = async (
  config: CognitoConfig,
  token: string
): Promise<CognitoValidationResult> => {
  const issuer = getIssuer(config);

  const decodedJwt = jwt.decode(token, { complete: true });

  if (!decodedJwt || typeof decodedJwt === 'string' || !decodedJwt.payload) {
    return { valid: false, reason: `Not a valid JWT token` };
  }

  if (decodedJwt.payload.iss !== issuer) {
    return { valid: false, reason: `token is not from correct User Pool` };
  }

  if (decodedJwt.payload.token_use !== config.tokenUse) {
    return { valid: false, reason: `Not an ${config.tokenUse} token` };
  }

  const kid = decodedJwt.header.kid;
  const pems = await loadPemsCached(issuer);
  const pem = pems[kid];

  if (!pem) {
    return { valid: false, reason: `Invalid ${config.tokenUse} token` };
  }

  try {
    const decodedToken: any = jwt.verify(token, pem, { issuer });
    return { valid: true, token: decodedToken };
  } catch (err) {
    return { valid: false, reason: err.message };
  }
};
