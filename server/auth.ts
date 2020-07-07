import { Express, Response } from 'express';
import { Config } from './app-config';
import { errorResponse } from './errors';
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
        try {
          const response = config.authConfig.validate(req);
          const userEmail = response?.email;
          if (typeof userEmail !== 'string') {
            return errorResponse(req, res, {
              error: Error('Email property missing on auth validate response'),
              status: 401,
              level: 'INFO',
              body: { message: 'Unauthorised' },
            });
          }
          res.locals.user =
            config.caseSensitiveEmail === true ? userEmail : userEmail.toLocaleLowerCase();
          next();
        } catch (error) {
          return errorResponse(req, res, { error, status: 401, body: { message: 'Unauthorised' } });
        }
      } else {
        //I'm passing in the access token in header under key accessToken
        const bearerHeader = req.headers.bearer;

        //Fail if token not present in header.
        if (typeof bearerHeader !== 'string')
          return errorResponse(req, res, {
            error: Error('id Token missing from header'),
            status: 401,
            level: 'INFO',
            body: { message: 'Unauthorised' },
          });

        const authResult = await validate(
          {
            region: config.authConfig.region,
            userPoolId: config.authConfig.cognitoUserPoolId,
            tokenUse: 'id',
          },
          bearerHeader
        );
        if (authResult.valid) {
          const userEmail = authResult.token.email as string;
          res.locals.user =
            config.caseSensitiveEmail === true ? userEmail : userEmail.toLocaleLowerCase();
          next();
        } else {
          return errorResponse(req, res, {
            error: new Error(authResult.reason),
            status: 401,
            level: 'INFO',
            body: { message: 'Unauthorised' },
          });
        }
      }
    } catch (e) {
      next(e);
    }
    return undefined;
  });
};
