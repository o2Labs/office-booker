import { Config } from '../app-config';
import { getUserDb, setUser } from '../db/users';
import { User, PutUserBody, getUser } from './model';
import { Arrays } from 'collection-fns';

export const putUser = async (
  config: Config,
  authUser: User,
  requestedUserEmail: string,
  putBody: PutUserBody
): Promise<User> => {
  const user = await getUserDb(config, requestedUserEmail);

  const quota = putBody.quota === null ? config.defaultWeeklyQuota : putBody.quota || user.quota;

  const validAutoApproved = config.reasonToBookRequired ? user.autoApproved : false

  const parseOffices = () => {
    if (putBody.role === undefined) {
      return user.adminOffices;
    }
    if (putBody.role.name === 'Office Admin') {
      return Arrays.choose(putBody.role.offices, (office) => {
        const officeQuota = config.officeQuotas.find((officeQuota) => officeQuota.id === office.id);
        return officeQuota?.id;
      });
    }

    return [];
  };

  const validOffices = parseOffices();
  const updatedUser = {
    email: user.email,
    quota,
    adminOffices: validOffices,
    autoApproved: validAutoApproved,
    created: user.created,
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
