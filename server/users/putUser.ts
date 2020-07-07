import { Config } from '../app-config';
import { getUserDb, setUser } from '../db/users';
import { User, PutUserBody, getUser } from './model';

export const putUser = async (
  config: Config,
  authUser: User,
  requestedUserEmail: string,
  putBody: PutUserBody
): Promise<User> => {
  const user = await getUserDb(config, requestedUserEmail);

  const quota = putBody.quota === null ? config.defaultWeeklyQuota : putBody.quota || user.quota;

  const parseOffices = () => {
    if (putBody.role === undefined) {
      return user.adminOffices;
    }
    if (putBody.role.name === 'Office Admin') {
      return putBody.role.offices;
    }

    return [];
  };

  const validOffices = parseOffices();
  const updatedUser = {
    email: user.email,
    quota,
    adminOffices: validOffices,
  };

  console.info(
    JSON.stringify({
      level: 'AUDIT',
      action: 'PutUser',
      details: {
        oldUser: user,
        updatedUser,
        authUser: { email: authUser.email },
      },
    })
  );
  await setUser(config, updatedUser);
  return await getUser(config, user.email);
};
