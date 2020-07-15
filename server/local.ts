import { configureApp } from './app';
import { parseConfigFromEnv } from './app-config';
import { config as configDotenv } from 'dotenv';

configDotenv();

const config = parseConfigFromEnv(process.env);
const app = configureApp({
  ...config,
  dynamoDB: {
    region: 'eu-west-1',
    endpoint: 'http://localhost:8000',
  }, /// only switch to testing if env switch is turned on e.g. cognitoTest. cognito user stuff becomes optional.
  authConfig: {
    type: 'test',
    validate: (req) => {
      return { email: req.get('bearer') };
    },
  },
  env: 'local',
});
app.set('port', 3030);
app.listen(3030);
console.info(`Running on port ${app.get('port')}`);
