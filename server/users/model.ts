import { Config, OfficeQuota } from '../app-config';
import { getUserDb, DbUser } from '../db/users';
import { Arrays } from 'collection-fns';

export type UserProfile = {
  email: string;
};

export type DefaultRole = { name: 'Default' };
export type SystemAdminRole = { name: 'System Admin' };
export type OfficeAdminRole = { name: 'Office Admin'; offices: OfficeQuota[] };
export type UserRole = DefaultRole | SystemAdminRole | OfficeAdminRole;

export type UserRoleName = UserRole['name'];

export const userRoleNames: UserRoleName[] = ['Default', 'System Admin', 'Office Admin'];

export type User = UserProfile & {
  quota: number;
  admin: boolean;
  role: UserRole;
  permissions: {
    canViewAdminPanel: boolean;
    canViewUsers: boolean;
    canEditUsers: boolean;
    canManageAllBookings: boolean;
    officesCanManageBookingsFor: OfficeQuota[];
  };
};

type PutOfficeAdminRole = Pick<OfficeAdminRole, 'name'> & {
  offices: { id: string }[];
};

export type PutUserBody = { quota?: number | null; role?: DefaultRole | PutOfficeAdminRole };

export const isOfficeAdminRole = (arg: any): arg is PutOfficeAdminRole => {
  if (typeof arg !== 'object') return false;
  const offices = arg.offices;
  return (
    arg.name === 'Office Admin' &&
    Array.isArray(offices) &&
    offices.every((o) => typeof o === 'object' && 'id' in o && typeof o.id === 'string')
  );
};

export const isUserRole = (arg: any): arg is UserRole =>
  typeof arg === 'object' &&
  (arg.name === 'Default' || arg.name === 'System Admin' || isOfficeAdminRole(arg));

export const isPutUserBody = (arg: any): arg is PutUserBody =>
  typeof arg === 'object' &&
  (typeof arg.quota === 'number' || typeof arg.quota === 'undefined' || arg.quota === null) &&
  (typeof arg.role === 'undefined' || (isUserRole(arg.role) && arg.role.name !== 'System Admin'));

const isAdmin = (config: Config, email: string): boolean =>
  config.systemAdminEmails.includes(email);

const getOfficesFromNames = (
  dbUser: DbUser,
  config: Config
): Required<{
  id?: string | undefined;
  name: string;
  quota: number;
  parkingQuota?: number | undefined;
}>[] =>
  Arrays.choose(dbUser.adminOffices ?? [], (nameOrId) => {
    const office = config.officeQuotas.find(
      (officeQuota) => officeQuota.name === nameOrId || officeQuota.id === nameOrId
    );
    return office;
  });

const makeOfficeAdmin = (config: Config, dbUser: DbUser): OfficeAdminRole => {
  return {
    name: 'Office Admin',
    offices: getOfficesFromNames(dbUser, config),
  };
};

export const makeUser = (config: Config, dbUser: DbUser): User => {
  const admin = isAdmin(config, dbUser.email);
  const isOfficeAdmin = (dbUser.adminOffices?.length ?? 0) > 0;
  return {
    email: dbUser.email,
    admin,
    quota: dbUser.quota ?? config.defaultWeeklyQuota,
    role: admin
      ? { name: 'System Admin' }
      : isOfficeAdmin
      ? makeOfficeAdmin(config, dbUser)
      : { name: 'Default' },
    permissions: {
      canViewAdminPanel: admin || isOfficeAdmin,
      canViewUsers: admin || isOfficeAdmin,
      canEditUsers: admin,
      canManageAllBookings: admin,
      officesCanManageBookingsFor: admin
        ? config.officeQuotas
        : getOfficesFromNames(dbUser, config),
    },
  };
};

/** Source: https://emailregex.com/ */
const emailRegex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
export const isValidEmail = (email: string): boolean => emailRegex.test(email);

export const getUser = async (config: Config, userEmail: string): Promise<User> => {
  const dbUser = await getUserDb(config, userEmail);
  return makeUser(config, dbUser);
};
