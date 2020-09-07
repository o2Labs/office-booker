import { Config } from '../app-config';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { attribute, table, hashKey } from '@aws/dynamodb-data-mapper-annotations';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { FunctionExpression, AttributePath } from '@aws/dynamodb-expressions';

export interface User {
  email: string;
  quota: number;
  adminOffices: string[];
  created: string;
}

@table('users')
export class UserModel {
  @hashKey()
  email!: string;
  @attribute()
  quota?: number;
  @attribute()
  adminOffices?: string[];
  @attribute({
    defaultProvider: () => new Date().toISOString(),
  })
  created?: string;
}

const toUser = (config: Config, dbUser: UserModel) => {
  return {
    email: dbUser.email,
    quota: dbUser.quota || config.defaultWeeklyQuota,
    adminOffices: dbUser.adminOffices || [],
    created: dbUser.created ?? new Date().toISOString(),
  };
};

const buildMapper = (config: Config) =>
  new DataMapper({
    client: new DynamoDB(config.dynamoDB),
    tableNamePrefix: config.dynamoDBTablePrefix,
  });

export const getAllUsers = async (config: Config): Promise<User[]> => {
  const mapper = buildMapper(config);
  const rows: User[] = [];
  for await (const item of mapper.scan(UserModel)) {
    rows.push(toUser(config, item));
  }
  return rows;
};

export const getUsersDb = async (config: Config, userEmails: string[]): Promise<User[]> => {
  const mapper = buildMapper(config);
  const emailsLowered = userEmails.map((e) => e.toLowerCase());
  const users = [];

  for await (const result of mapper.batchGet(
    emailsLowered.map((userEmail) => Object.assign(new UserModel(), { email: userEmail }))
  )) {
    users.push(result);
  }
  const usersByEmail = new Map(users.map((u) => [u.email, u]));
  return emailsLowered.map((email) => toUser(config, usersByEmail.get(email) ?? { email }));
};

export const getUserDb = async (config: Config, userEmail: string): Promise<User> => {
  const mapper = buildMapper(config);
  const email = userEmail.toLocaleLowerCase();

  try {
    const result = await mapper.get(Object.assign(new UserModel(), { email }));
    console.log(result);
    return toUser(config, result);
  } catch (err) {
    if (err.name === 'ItemNotFoundException') {
      return toUser(config, { email });
    } else {
      throw err;
    }
  }
};

export const ensureUserExists = async (
  config: Config,
  user: User
): Promise<{ userCreated: boolean }> => {
  const mapper = buildMapper(config);

  // Ensure object exists
  try {
    await mapper.put(
      Object.assign(new UserModel(), {
        email: user.email,
        quota: user.quota === config.defaultWeeklyQuota ? undefined : user.quota,
        adminOffices: user.adminOffices.length === 0 ? undefined : user.adminOffices,
        created: new Date().toISOString(),
      }),
      {
        condition: new FunctionExpression('attribute_not_exists', new AttributePath('email')),
      }
    );
    return { userCreated: true };
  } catch (err) {
    if (err.code !== 'ConditionalCheckFailedException') {
      throw err;
    }
    return { userCreated: false };
  }
};

export const setUser = async (config: Config, user: User): Promise<void> => {
  const mapper = buildMapper(config);

  const { userCreated } = await ensureUserExists(config, user);

  if (!userCreated) {
    await mapper.update(
      Object.assign(new UserModel(), {
        email: user.email,
        quota: user.quota === config.defaultWeeklyQuota ? undefined : user.quota,
        adminOffices: user.adminOffices.length === 0 ? undefined : user.adminOffices,
        create: user.created,
      })
    );
  }
};
