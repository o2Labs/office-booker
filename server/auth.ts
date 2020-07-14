import { Express, Response } from 'express';
import { Config } from './app-config';
import { Unauthorized } from './errors';
import { validate } from './cognito';

export const getAuthUserEmail = (res: Response): string => {
  const user = res.locals.user as unknown;
  if (user === undefined || typeof user !== 'string') {
    throw new Error(`Can't get current user`);
  }
  return user;
};

export const configureAuth = (config: Config, app: Express): Express => {
  return app.use(async (req, res, next) => {
    try {
      if (config.authConfig.type === 'test') {
        const response = config.authConfig.validate(req);
        const userEmail = response?.email;
        if (typeof userEmail !== 'string') {
          throw new Unauthorized('Email property missing on auth validate response');
        }
        res.locals.user =
          config.caseSensitiveEmail === true ? userEmail : userEmail.toLocaleLowerCase();
        next();
      } else {
        //I'm passing in the access token in header under key accessToken
        const authHeader = req.headers.authorization;

        //Fail if token not present in header.
        if (typeof authHeader !== 'string') throw new Unauthorized('Header not set');
        const bearerRegex = /^Bearer ([a-zA-Z0-9_\-\.]*)$/g;
        const parsed = bearerRegex.exec(authHeader);
        const token = parsed?.[1];
        if (typeof token !== 'string') throw new Unauthorized('Could not parse Bearer token');

        const authResult = await validate(
          {
            region: config.authConfig.region,
            userPoolId: config.authConfig.cognitoUserPoolId,
            tokenUse: 'id',
          },
          token
        );
        if (authResult.valid) {
          const userEmail = authResult.token.email as string;
          res.locals.user =
            config.caseSensitiveEmail === true ? userEmail : userEmail.toLocaleLowerCase();
          next();
        } else {
          throw new Unauthorized('Bearer token not valid');
        }
      }
    } catch (e) {
      next(e);
    }
    return undefined;
  });
};
