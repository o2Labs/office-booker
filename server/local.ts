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
          return { email: req.get('authorization')?.slice(7) };
        },
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
