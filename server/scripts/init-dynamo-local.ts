import { createLocalTables } from './create-dynamo-tables';

createLocalTables(
  { deleteTablesFirst: true },
  {
    region: 'eu-west-1',
    endpoint: 'http://localhost:8000',
  }
).catch((e) => {
  console.error(e);
  process.exit(1);
});
