import { createServer, proxy } from 'aws-serverless-express';
import { configureApp } from './app';
import { parseConfigFromEnv } from './app-config';

const config = parseConfigFromEnv(process.env);
const app = configureApp(config);
const server = createServer(app);

export const handler = (event: any, context: any) => {
  return proxy(server, event, context);
};
