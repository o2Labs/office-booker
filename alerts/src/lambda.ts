import { gunzipSync } from 'zlib';
import { Context } from 'aws-lambda';
import fetch from 'node-fetch';

interface LogGroupEvent {
  awslogs?: {
    data?: string;
  };
}

export const processEvent = async (
  fetchMethod: typeof fetch,
  env: string,
  event: LogGroupEvent | undefined
) => {
  const postNotification = async (message: string) => {
    // TODO: implement logging
  };

  const parseEvents = (data?: string) => {
    if (typeof data !== 'string') {
      throw new Error('Unexpected type of data');
    }
    try {
      const payload = Buffer.from(data, 'base64');
      const parsed = JSON.parse(gunzipSync(payload).toString());
      return parsed;
    } catch (err) {
      throw new Error(`Failed reading event: deserializing\n${err.message}`);
    }
  };

  const getMessage = (event: LogGroupEvent | undefined): string => {
    try {
      const events = parseEvents(event?.awslogs?.data);
      const logEvents = events?.logEvents;
      if (!Array.isArray(logEvents)) {
        throw new Error('Log events is not an array');
      }
      const messages = logEvents.map((item, i) => {
        const message = item?.message;
        if (typeof message !== 'string') {
          throw new Error(`logEvent[${i}].message is not a string: ${JSON.stringify(item)}`);
        }
        return message;
      });

      return `Issue on office-booker-${env}: ${messages.join('\n')}`;
    } catch (err) {
      console.error(err);
      return `Unparsable issue office-booker-${env}: ${err.message}`;
    }
  };

  try {
    const message = getMessage(event);
    await postNotification(message);
  } catch (error) {
    console.error(error);
  }
};

export const handler = async (event: LogGroupEvent | undefined, context: Context) => {
  const env = process.env.ENV;
  if (env === undefined) {
    console.error('ENV not defined');
  } else {
    await processEvent(fetch, env, event);
  }
};
