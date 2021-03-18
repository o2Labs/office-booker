import { Config } from '../app-config';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { attribute, table, hashKey } from '@aws/dynamodb-data-mapper-annotations';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { FunctionExpression, AttributePath } from '@aws/dynamodb-expressions';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

export interface DbUser {
  email: string;
  quota?: number;
  adminOffices?: string[];
  autoApproved?: boolean;
  created: string;
}

@table('users')
export class UserModel implements DbUser {
  @hashKey()
  email!: string;
  @attribute()
  quota?: number;
  @attribute()
  adminOffices?: string[];
  @attribute()
  autoApproved?: boolean;
  @attribute({
    defaultProvider: () => new Date().toISOString(),
  })
  created!: string;
}

const buildMapper = (config: Config) =>
  new DataMapper({
    client: new DynamoDB(config.dynamoDB),
    tableNamePrefix: config.dynamoDBTablePrefix,
  });

export const getAllUsers = async (config: Config): Promise<DbUser[]> => {
  const mapper = buildMapper(config);
  const rows: UserModel[] = [];
  for await (const item of mapper.scan(UserModel)) {
    rows.push(item);
  }
  return rows;
};

export const getUsersDb = async (config: Config, userEmails: string[]): Promise<DbUser[]> => {
  const mapper = buildMapper(config);
  const emailsLowered = userEmails.map((e) => e.toLowerCase());
  const users = [];

  for await (const result of mapper.batchGet(
    emailsLowered.map((userEmail) => Object.assign(new UserModel(), { email: userEmail }))
  )) {
    users.push(result);
  }
  const usersByEmail = new Map(users.map((u) => [u.email, u]));
  return emailsLowered.map(
    (email) => usersByEmail.get(email) ?? { email, created: new Date().toISOString() }
  );
};

const getUserCognito = async (config: Config, userEmail: string) => {
  if (config.authConfig.type !== 'cognito') {
    return { email: userEmail };
  }
  const cognito = new CognitoIdentityServiceProvider();
  try {
    const cognitoUser = await cognito
      .adminGetUser({ UserPoolId: config.authConfig.cognitoUserPoolId, Username: userEmail })
      .promise();
    return {
      email: userEmail,
      created: cognitoUser.UserCreateDate?.toISOString(),
    };
  } catch (err) {
    if (err.code === 'UserNotFoundException') {
      return undefined;
    } else {
      throw err;
    }
  }
};

const pickCreated = (a?: string, b?: string) => {
  if (a && b) {
    return a < b ? a : b;
  }
  return a ?? b ?? new Date().toISOString();
};

export const getUserDb = async (config: Config, userEmail: string): Promise<DbUser> => {
  const cognitoUser = await getUserCognito(config, userEmail);
  const mapper = buildMapper(config);
  const email = userEmail.toLocaleLowerCase();

  const dbUser = await (async () => {
    try {
      const result = await mapper.get(Object.assign(new UserModel(), { email }));
      return result;
    } catch (err) {
      if (err.name === 'ItemNotFoundException') {
        return undefined;
      } else {
        throw err;
      }
    }
  })();

  return {
    email,
    quota: dbUser?.quota,
    adminOffices: dbUser?.adminOffices,
    autoApproved: dbUser?.autoApproved,
    created: pickCreated(cognitoUser?.created, dbUser?.created),
  };
};

export const ensureUserExists = async (
  config: Config,
  user: DbUser
): Promise<{ userCreated: boolean }> => {
  const mapper = buildMapper(config);

  // Ensure object exists
  try {
    await mapper.put(
      Object.assign(new UserModel(), {
        email: user.email,
        quota: user.quota === config.defaultWeeklyQuota ? undefined : user.quota,
        adminOffices: (user.adminOffices?.length ?? 0) === 0 ? undefined : user.adminOffices,
        autoApproved: config.reasonToBookRequired ? user?.autoApproved === true : false,
        created: user.created,
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

export const setUser = async (config: Config, user: DbUser): Promise<void> => {
  const mapper = buildMapper(config);

  const { userCreated } = await ensureUserExists(config, user);

  if (!userCreated) {
    await mapper.update(
      Object.assign(new UserModel(), {
        email: user.email,
        quota: user.quota === config.defaultWeeklyQuota ? undefined : user.quota,
        adminOffices: (user.adminOffices?.length ?? 0) === 0 ? undefined : user.adminOffices,
        autoApproved: config.reasonToBookRequired ? user?.autoApproved === true : false,
        created: user.created,
      })
    );
  }
};
