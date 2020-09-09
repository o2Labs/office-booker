import { options } from 'yargs';
import { SSM } from 'aws-sdk';

const args = options({
  stack: { type: 'string', demandOption: true },
  'first-run': { type: 'boolean', default: false },
}).argv;

const ssm = new SSM();

const COMPLETE = 'completed';

const getMigrationName = (migration: string) => `/${args.stack}/${migration}`;

const completeMigration = async (migration: string) => {
  await ssm.putParameter({ Name: getMigrationName(migration), Value: COMPLETE }).promise();
};

const needsMigration = async (migration: string) => {
  if (args['first-run']) {
    await completeMigration(migration);
    return false;
  } else {
    const parameter = await ssm.getParameter({ Name: getMigrationName(migration) }).promise();
    return parameter?.Parameter?.Value !== COMPLETE;
  }
};

const migrateUsers = async () => {
  const shouldMigrate = await needsMigration('users');
  if (shouldMigrate) {
    // TODO: Loop through users
  }
};

const migrate = async () => {
  await migrateUsers();
};

migrate().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
