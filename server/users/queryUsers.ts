import { Config } from '../app-config';
import { getAllUsers, getUserDb } from '../db/users';
import { User, makeUser } from './model';

const getAllAdmins = async (config: Config) => {
  const results = [];
  for (const email of config.systemAdminEmails) {
    const user = await getUserDb(config, email);
    results.push(user);
  }
  return results;
};

export const queryUsers = async (
  config: Config,
  query: { customQuota: boolean; roleName?: string }
): Promise<User[]> => {
  const allUsers =
    query.roleName === 'System Admin' ? await getAllAdmins(config) : await getAllUsers(config);
  return allUsers
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
};
