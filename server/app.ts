import express, { Response, Request, NextFunction } from 'express';
import morgan from 'morgan';
import { Config, OfficeQuota } from './app-config';

import { configureAuth, getAuthUserEmail } from './auth';
import { getUser, isPutUserBody, isValidEmail } from './users/model';
import { queryUsers } from './users/queryUsers';
import { putUser } from './users/putUser';
import { isCreateBooking, mapBookings } from './bookings/model';
import { createBooking } from './bookings/createBooking';
import { getUserBookings } from './db/bookings';
import { getOffice } from './getOffices';
import { deleteBooking } from './bookings/deleteBooking';
import { errorResponse, HttpError, Forbidden, NotFound, Unauthorized } from './errors';
import { queryBookings } from './bookings/queryBookings';
import { parse } from 'date-fns';
import { registerUser, isRegisterBody } from './users/register';
import { getStats } from './stats';

export const configureApp = (config: Config) => {
  const getAuthUser = (res: Response) => getUser(config, getAuthUserEmail(res));
  const validateEmail = (email: string) => {
    if (config.validEmailMatch !== undefined && !config.validEmailMatch.test(email)) return false;
    if (!isValidEmail(email)) return false;
    return true;
  };

  const normaliseEmail = (email: string) =>
    config.caseSensitiveEmail === true ? email : email.toLocaleLowerCase();

  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  if (config.env !== 'test') {
    app.use(morgan('combined'));
  }

  app.use(async (req, res, next) => {
    res.locals.env = config.env;
    next();
  });

  if (config.env !== 'local' && config.env !== 'test') {
    app.set('trust proxy', true);
  }

  app.get('/api/config', (req, res, next) => {
    try {
      const clientConfig = {
        version: '2.1.0',
        showTestBanner: config.showTestBanner,
        auth:
          config.authConfig.type === 'cognito'
            ? {
                type: 'cognito',
                region: config.authConfig.region,
                userPoolId: config.authConfig.cognitoUserPoolId,
                webClientId: config.authConfig.cognitoClientId,
              }
            : { type: 'test' },
        emailRegex: config.validEmailMatch?.source,
        advancedBookingDays: config.advanceBookingDays,
      };
      return res.set('Cache-Control', 'public, max-age=3600').json(clientConfig);
    } catch (err) {
      return next(err);
    }
  });

  app.post('/api/selftest', async (req, res, next) => {
    try {
      if (config.selfTestKey === undefined || config.selfTestKey.length < 20) {
        throw new NotFound('Self test key not set or less than 20 characters');
      }
      if (config.selfTestUser === undefined || !validateEmail(config.selfTestUser)) {
        throw new NotFound('Self test user not set or not a valid email address');
      }
      if (req.headers.bearer !== config.selfTestKey) {
        throw new Forbidden(`Incorrect self-test key`);
      }
      const testUserEmail = normaliseEmail(config.selfTestUser);
      const office = getOffice(config, config.officeQuotas[0].id);
      const user = await getUser(config, testUserEmail);
      const bookings = mapBookings(config, await getUserBookings(config, testUserEmail));
      return res.json({ office, user, bookings });
    } catch (error) {
      return next(error);
    }
  });

  app.use((req, res, next) => {
    if (config.readonly) {
      if (req.method === 'GET' || req.method === 'OPTIONS' || req.method === 'HEAD') {
        return next();
      } else {
        return next(
          new HttpError({ httpMessage: 'Service currently in read-only mode', status: 503 })
        );
      }
    }
    return next();
  });

  app.post('/api/users', async (req, res, next) => {
    try {
      const body = req.body;
      if (!isRegisterBody(body)) {
        throw new HttpError({ httpMessage: 'Bad Request', status: 400 });
      }
      const normalisedEmail = normaliseEmail(body.email);
      if (!isValidEmail(normalisedEmail)) {
        throw new HttpError({ httpMessage: 'Email not valid', status: 400 });
      }
      await registerUser(config, normalisedEmail);
      return res.sendStatus(204);
    } catch (err) {
      return next(err);
    }
  });

  configureAuth(config, app);

  app.get('/api/offices', async (_req, res, next) => {
    try {
      return res.json(config.officeQuotas);
    } catch (err) {
      return next(err);
    }
  });

  app.get('/api/offices/:officeId', async (req, res, next) => {
    try {
      const officeId = req.params.officeId;
      const office = await getOffice(config, officeId);
      return res.json(office);
    } catch (err) {
      return next(err);
    }
  });

  app.get('/api/users', async (req, res, next) => {
    try {
      const quota = req.query.quota?.toString();
      const role: string | undefined = req.query?.role?.toString();
      const filterQuota = quota?.toLocaleLowerCase() === 'custom';
      const emailPrefix = req.query.emailPrefix?.toString().toLowerCase();
      const paginationToken = req.query.paginationToken?.toString();
      const authUser = await getAuthUser(res);
      if (!authUser.permissions.canViewUsers) {
        throw new Forbidden(`${authUser.email} attempted to list users`);
      }
      const users = await queryUsers(config, {
        customQuota: filterQuota,
        roleName: role,
        emailPrefix,
        paginationToken,
      });
      return res.json(users);
    } catch (err) {
      return next(err);
    }
  });

  app.get('/api/users/:email', async (req, res, next) => {
    try {
      // Anyone can fetch themselves.
      // Admins can fetch anyone.
      const userEmail = normaliseEmail(req.params.email);
      if (!validateEmail(userEmail)) {
        throw new NotFound(`Not a valid email address: ${userEmail}`);
      }
      const authUser = await getAuthUser(res);
      if (userEmail !== authUser.email && !authUser.permissions.canViewUsers) {
        throw new Forbidden(`${authUser.email} attempted to get another user`);
      }
      const userState = await getUser(config, userEmail);
      return res.json(userState);
    } catch (err) {
      return next(err);
    }
  });

  app.put('/api/users/:email', async (req, res, next) => {
    try {
      const userEmail = normaliseEmail(req.params.email);
      if (!validateEmail(userEmail)) {
        throw new NotFound(`Not a valid email address: ${userEmail}`);
      }
      const putBody = req.body;
      if (!isPutUserBody(putBody)) {
        throw new HttpError({ httpMessage: 'Bad Request', status: 400 });
      }
      const authUser = await getAuthUser(res);
      if (!authUser.permissions.canEditUsers) {
        throw new Forbidden(`${authUser.email} is not a system admin`);
      }

      const updatedUser = await putUser(config, authUser, userEmail, putBody);
      return res.json(updatedUser);
    } catch (err) {
      return next(err);
    }
  });

  app.get('/api/bookings', async (req, res, next) => {
    try {
      const parseEmail = (): { email?: string } => {
        const userEmail = req.query.user as unknown;
        if (typeof userEmail === 'undefined') {
          return {};
        }
        if (typeof userEmail !== 'string') {
          throw new HttpError({ httpMessage: 'Invalid email type', status: 400 });
        }
        const email = normaliseEmail(userEmail);
        if (!validateEmail(email)) {
          throw new HttpError({ httpMessage: 'Invalid email', status: 400 });
        }
        return { email };
      };

      const parseOffice = (): { office?: OfficeQuota } => {
        const officeQuery = req.query.office as unknown;
        if (typeof officeQuery === 'undefined') {
          return {};
        }
        if (typeof officeQuery !== 'string') {
          throw new HttpError({ httpMessage: 'Invalid office type', status: 400 });
        }
        const office = config.officeQuotas.find((o) => o.id === officeQuery);
        if (office === undefined) {
          throw new HttpError({ httpMessage: 'Unknown office query', status: 400 });
        }
        return { office };
      };

      const parseDate = (): { date?: string } => {
        const date = req.query.date as unknown;
        if (typeof date === 'undefined') {
          return {};
        }
        if (typeof date !== 'string') {
          throw new HttpError({ httpMessage: 'Invalid date type', status: 400 });
        }
        const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
        if (Number.isNaN(parsedDate.getTime())) {
          throw new HttpError({ httpMessage: 'Invalid date', status: 400 });
        }
        return { date };
      };

      const parsedQuery = { ...parseEmail(), ...parseOffice(), ...parseDate() };

      const authUser = await getAuthUser(res);

      const bookings = await queryBookings(config, authUser, parsedQuery);
      return res.json(bookings);
    } catch (err) {
      return next(err);
    }
  });

  app.post('/api/bookings/', async (req, res, next) => {
    try {
      const newBooking = req.body;
      if (!isCreateBooking(newBooking)) {
        throw new HttpError({ httpMessage: `Bad request body`, status: 400 });
      }
      if (!validateEmail(newBooking.user)) {
        throw new HttpError({ httpMessage: `Invalid user email address`, status: 400 });
      }
      newBooking.user = normaliseEmail(newBooking.user);
      const authUser = await getAuthUser(res);
      const result = await createBooking(config, authUser, {
        date: newBooking.date,
        office: newBooking.office,
        user: newBooking.user,
        parking: newBooking.parking,
      });
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  });

  app.delete('/api/bookings/:id', async (req, res, next) => {
    try {
      const userQuery = req.query.user as unknown;
      const bookingId = req.params.id;
      const userEmail = (() => {
        switch (typeof userQuery) {
          case 'string':
            return normaliseEmail(userQuery);
          case 'undefined':
            return undefined;
          default:
            throw new HttpError({ httpMessage: 'Bad request', status: 400 });
        }
      })();
      if (userEmail !== undefined && !validateEmail(userEmail)) {
        throw new HttpError({ httpMessage: 'Bad request - invalid email', status: 400 });
      }

      const authUser = await getAuthUser(res);

      await deleteBooking(config, authUser, {
        id: bookingId,
        email: userEmail ?? authUser.email,
      });
      return res.sendStatus(204);
    } catch (err) {
      return next(err);
    }
  });

  app.get('/api/stats', async (req, res) => {
    const authUser = await getAuthUser(res);
    if (!authUser.permissions.canViewAdminPanel) {
      throw new Unauthorized();
    }

    const stats = await getStats(config, authUser);
    return res.json(stats);
  });

  app.all('/api/*', (req, res) => {
    return res.status(404).json({
      message: 'Not Found',
    });
  });

  app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof HttpError) {
      return errorResponse(req, res, {
        body: { message: error.httpMessage },
        status: error.status,
        error,
        level: error.level,
      });
    }
    // todo: get env to check for prod deploy
    return errorResponse(req, res, {
      error,
      body: { message: 'Something went wrong. We are looking into it.' },
    });
  });

  return app;
};
