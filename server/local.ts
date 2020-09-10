import { configureApp } from './app';
import { parseConfigFromEnv, Config } from './app-config';
import { config as configDotenv } from 'dotenv';

configDotenv();

const getLocalConfig = (): Config => {
  try {
    return parseConfigFromEnv(process.env);
  } catch (error) {
    console.log('Env not configured correctly, falling back to stub setup\n' + error.message);
    return {
      advanceBookingDays: 14,
      dataRetentionDays: 30,
      defaultWeeklyQuota: 1,
      officeQuotas: [{ id: 'the-office', name: 'The Office', quota: 10, parkingQuota: 10 }],
      showTestBanner: true,
      systemAdminEmails: ['mock.user@domain.test'],
      authConfig: {
        type: 'test',
        validate: (req) => {
          const bearerPrefix = 'basic ';
          const authorization = req.get('authorization');
          if (authorization === undefined) {
            return {};
          }
          if (!authorization.toLowerCase().startsWith(bearerPrefix)) {
            throw new Error('Malformed bearer prefix');
          }
          const token = authorization.slice(bearerPrefix.length);
          const decoded = Buffer.from(token, 'base64').toString();
          return { email: decoded.split(':')[0] };
        },
        users: [],
      },
    };
  }
};

const config = getLocalConfig();

const app = configureApp({
  ...config,
  dynamoDB: {
    region: 'eu-west-1',
    endpoint: 'http://localhost:8000',
  },
  env: 'local',
});

app.set('port', 3030);
app.listen(3030);
console.info(`Running on port ${app.get('port')}`);
