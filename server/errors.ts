import shortid from 'shortid';
import { Response, Request } from 'express';
import { getAuthUserEmail } from './auth';

export class HttpError extends Error {
  readonly httpMessage: string;
  readonly status: number;
  readonly level: ErrorLevel;
  constructor(args: {
    httpMessage: string;
    internalMessage?: string;
    status: number;
    level?: ErrorLevel;
  }) {
    super(args.internalMessage || args.httpMessage);
    this.httpMessage = args.httpMessage;
    this.status = args.status;
    this.level = args.level ?? 'INFO';
  }
}

export class NotFound extends HttpError {
  constructor(internalMessage?: string) {
    super({ httpMessage: 'Not Found', status: 404, internalMessage });
  }
}

export class Forbidden extends HttpError {
  constructor(internalMessage?: string) {
    super({ httpMessage: 'Forbidden', status: 403, internalMessage });
  }
}

export type ErrorLevel = 'ERROR' | 'INFO';

type ErrorResponseArgs = {
  error: Error;
  level?: ErrorLevel;
  status?: number;
  body: {
    message: string;
    [key: string]: any;
  };
};

const tryGetCurrentUser = (res: Response) => {
  try {
    return getAuthUserEmail(res);
  } catch {
    return undefined;
  }
};

export const errorResponse = (req: Request, res: Response, args: ErrorResponseArgs) => {
  const reference = shortid();
  const { error, level, status } = {
    level: 'ERROR' as ErrorLevel,
    status: 500,
    ...args,
  };
  const request = {
    method: req.method,
    path: req.url,
    query: req.query,
    ip: req.ip,
    user: tryGetCurrentUser(res),
    body: req.body,
  };
  const errorString =
    error.message +
    (error instanceof CustomError ? +'\n' + error.inner.message : '') +
    '\n' +
    error.stack;
  const detailedInfo =
    res.locals.env === 'dev' || res.locals.env === 'local' || res.locals.env === 'test'
      ? { error: errorString }
      : {};
  const responseBody = {
    ...args.body,
    reference,
    ...detailedInfo,
  };
  const response = {
    status,
    body: responseBody,
  };
  const consoleLog = level === 'ERROR' ? console.error : console.info;
  consoleLog(JSON.stringify({ level, reference, error: errorString, request, response }, null, 2));
  return res.status(status).json(responseBody);
};

export class CustomError extends Error {
  inner: Error;
  constructor(message: string, error: Error) {
    super(message);
    this.inner = error;
  }
}
