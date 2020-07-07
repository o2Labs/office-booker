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
  },
  env: 'local',
});
app.set('port', 3030);
app.listen(3030);
console.info(`Running on port ${app.get('port')}`);
