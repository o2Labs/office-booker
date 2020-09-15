import { options } from 'yargs';
import { SSM } from 'aws-sdk';
import { parseConfigFromEnv, Config } from '../app-config';
import { saveCognitoUsersToDb } from './1-save-users-to-db';

/** Collection all migrations that should be applied to the system */
type Migrations = {
  /** Unique name of the migration, this should not change */
  [migrationName: string]:
    | {
        /** Async function to perform maintenance work */
        execute: (config: Config) => Promise<void>;
      }
    | {
        /**
         * If set, the next deploy will fail if this migration was not previously executed.
         * This should explain why the migration can't be run, and which version should be installed first.
         */
        reasonToFailPreCheck: string;
      };
};

/** Enter migrations here */
const migrations: Migrations = {
  '1-save-users-to-db': {
    execute: saveCognitoUsersToDb,
  },
};

/**
 * Plumbing to execute migrations
 */

const args = options({
  stack: { type: 'string', demandOption: true },
  'first-run': { type: 'boolean', default: false },
  'pre-check': { type: 'boolean', default: false },
}).argv;

const firstRun = args['first-run'];
const preCheck = args['pre-check'];

const ssm = new SSM();

const COMPLETE = 'completed';
type MigrationStatus = 'completed' | 'pending';

const getMigrationSSMParamName = (migrationName: string) => `/${args.stack}/${migrationName}`;

const completeMigration = async (migrationName: string) => {
  await ssm
    .putParameter({
      Name: getMigrationSSMParamName(migrationName),
      Value: COMPLETE,
      Type: 'String',
    })
    .promise();
};

const getMigrationStatus = async (migrationName: string): Promise<MigrationStatus> => {
  try {
    const parameter = await ssm
      .getParameter({ Name: getMigrationSSMParamName(migrationName) })
      .promise();
    return parameter?.Parameter?.Value === COMPLETE ? COMPLETE : 'pending';
  } catch (err) {
    if (err.code === 'ParameterNotFound') {
      return 'pending';
    }
    throw err;
  }
};

const migrate = async () => {
  if (firstRun) {
    if (preCheck) {
      // Do nothing - we're always ready to do the first deploy
    } else {
      for (const name of Object.keys(migrations)) {
        await completeMigration(name);
      }
    }
  } else {
    if (preCheck) {
      const failedPreChecks: { name: string; reason: string }[] = [];
      for (const [name, migration] of Object.entries(migrations)) {
        if ('reasonToFailPreCheck' in migration) {
          const status = await getMigrationStatus(name);
          if (status === 'pending') {
            failedPreChecks.push({ name, reason: migration.reasonToFailPreCheck });
          }
        }
      }
      if (failedPreChecks.length > 0) {
        const failureMessages = failedPreChecks.map(
          (failure) => `\t${failure.name}: ${failure.reason}`
        );
        console.error(`Failed pre-deploy migration checks:\n${failureMessages.join('\n')}`);
        process.exitCode = 1;
      }
    } else {
      if (process.env.MIGRATE_ENV === undefined) throw Error('Env required for running migrations');
      const config = parseConfigFromEnv(JSON.parse(process.env.MIGRATE_ENV));
      for (const [name, migration] of Object.entries(migrations)) {
        if ('execute' in migration) {
          const status = await getMigrationStatus(name);
          if (status === 'pending') {
            console.log('Beginning migration ', name);
            await migration.execute(config);
            await completeMigration(name);
            console.log('Completed migration ', name);
          }
        }
      }
    }
  }
};

migrate().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
