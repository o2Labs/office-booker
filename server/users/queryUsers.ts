import { Config } from '../app-config';
import { getAllUsers, DbUser } from '../db/users';
import { User, makeUser } from './model';
import { CognitoIdentityServiceProvider, AWSError } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';

export type CognitoUser = {
  email: string;
  enabled: boolean;
  created: string;
  lastModified: string;
};

const getAllCognitoUsers = async (config: Config): Promise<CognitoUser[]> => {
  if (config.authConfig.type !== 'cognito') {
    return [];
  }
  const { cognitoUserPoolId } = config.authConfig;
  const cognito = new CognitoIdentityServiceProvider();
  const emails: CognitoUser[] = [];
  let paginationToken: string | undefined = undefined;
  do {
    const response: PromiseResult<
      CognitoIdentityServiceProvider.ListUsersResponse,
      AWSError
    > = await cognito
      .listUsers({
        UserPoolId: cognitoUserPoolId,
        AttributesToGet: ['email'],
        PaginationToken: paginationToken,
      })
      .promise();
    paginationToken = response.PaginationToken;
    for (const user of response.Users ?? []) {
      const email = user.Attributes?.find((att) => att.Name === 'email')?.Value;
      if (
        email !== undefined &&
        user.Enabled !== undefined &&
        user.UserCreateDate &&
        user.UserLastModifiedDate
      ) {
        emails.push({
          email,
          enabled: user.Enabled,
          created: user.UserCreateDate.toISOString(),
          lastModified: user.UserLastModifiedDate.toISOString(),
        });
      }
    }
  } while (paginationToken !== undefined);
  return emails;
};

const mergeUserSets = (config: Config, users: DbUser[], cognitoUsers: CognitoUser[]): DbUser[] => {
  const usersByEmail = new Map(users.map((user) => [user.email, user]));
  for (const cognitoUser of cognitoUsers) {
    if (!usersByEmail.has(cognitoUser.email)) {
      usersByEmail.set(cognitoUser.email, {
        email: cognitoUser.email,
        quota: config.defaultWeeklyQuota,
        adminOffices: [],
        created: cognitoUser.created,
      });
    }
  }
  return Array.from(usersByEmail.values());
};

export type UsersQuery = {
  customQuota: boolean;
  roleName?: string;
  emailPrefix?: string;
  paginationToken?: string;
};

export type QueryUsersResponse = { users: User[]; paginationToken?: string };

export const queryUsers = async (
  config: Config,
  query: UsersQuery
): Promise<QueryUsersResponse> => {
  const dbUsers = await getAllUsers(config);
  const cognitoUsers =
    !query.customQuota && query.roleName === undefined ? await getAllCognitoUsers(config) : [];
  const potentialUsers = mergeUserSets(config, dbUsers, cognitoUsers);
  const users = potentialUsers
    .map((user) => makeUser(config, user))
    .filter((user) => {
      if (query.roleName) {
        if (user.role.name !== query.roleName) return false;
      }
      if (query.customQuota) {
        if (user.quota === config.defaultWeeklyQuota) return false;
      }
      if (query.emailPrefix !== undefined) {
        if (!user.email.startsWith(query.emailPrefix)) return false;
      }
      return true;
    });
  return { users };
};
