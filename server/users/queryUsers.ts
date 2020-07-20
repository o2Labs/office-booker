import { Config } from '../app-config';
import { getAllUsers, getUserDb, getUsersDb } from '../db/users';
import { User, makeUser } from './model';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const getAllAdmins = async (config: Config) => {
  const results = [];
  for (const email of config.systemAdminEmails) {
    const user = await getUserDb(config, email);
    results.push(user);
  }
  return results;
};

const getCognitoUsers = async (
  config: Config,
  paginationToken?: string
): Promise<{ users: User[]; paginationToken?: string }> => {
  if (config.authConfig.type !== 'cognito') {
    return { users: [] };
  }
  const cognito = new CognitoIdentityServiceProvider();
  const cognitoResponse = await cognito
    .listUsers({
      UserPoolId: config.authConfig.cognitoUserPoolId,
      AttributesToGet: ['email'],
      Filter: "status='Enabled'",
      Limit: 60, // Max size of dynamoDb batch get
      PaginationToken: paginationToken,
    })
    .promise();
  const cognitoEmails = (cognitoResponse.Users ?? [])
    .map((user) => user.Attributes?.[0].Value as string)
    .filter((e) => e !== undefined);
  const dbUsers = await getUsersDb(config, cognitoEmails);
  return {
    users: dbUsers.map((u) => makeUser(config, u)),
    paginationToken: cognitoResponse.PaginationToken,
  };
};

export const queryUsers = async (
  config: Config,
  query: { customQuota: boolean; roleName?: string; paginationToken?: string }
): Promise<{ users: User[]; paginationToken?: string }> => {
  if (!query.customQuota && query.roleName === undefined) {
    return getCognitoUsers(config, query.paginationToken);
  }
  const allUsers =
    query.roleName === 'System Admin' ? await getAllAdmins(config) : await getAllUsers(config);
  const users = allUsers
    .map((user) => makeUser(config, user))
    .filter((user) => {
      if (query.roleName) {
        if (user.role.name !== query.roleName) return false;
      }
      if (query.customQuota) {
        if (user.quota === config.defaultWeeklyQuota) return false;
      }
      return true;
    });
  return { users };
};
