import { Config, parseConfigFromEnv } from '../app-config';
import { getAllBookings } from '../db/bookings';
import { mapBookings, Booking } from '../bookings/model';
import { makeUser, User } from '../users/model';
import { getAllUsers, User as DbUser } from '../db/users';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { config as configDotenv } from 'dotenv';
import { writeFileSync } from 'fs';

configDotenv();

export type Backup = {
  bookings: Booking[];
  users: User[];
};

const getAllCognitoUserEmails = async (config: Config) => {
  if (config.authConfig.type !== 'cognito') {
    return [];
  }
  const { cognitoUserPoolId } = config.authConfig;
  const cognito = new CognitoIdentityServiceProvider();
  const getNextUsers = (paginationToken?: string) =>
    cognito
      .listUsers({
        UserPoolId: cognitoUserPoolId,
        AttributesToGet: ['email'],
        PaginationToken: paginationToken,
      })
      .promise();
  const emails: string[] = [];
  let response = await getNextUsers();
  while (response.Users?.length ?? (0 > 0 && response.PaginationToken !== undefined)) {
    for (const user of response.Users ?? []) {
      const email = user.Attributes?.[0].Value;
      if (email !== undefined) {
        emails.push(email);
      }
    }
    response = await getNextUsers(response.PaginationToken);
  }
  return emails;
};

const mergeUserSets = (config: Config, users: DbUser[], cognitoEmails: string[]) => {
  const usersByEmail = new Map(users.map((user) => [user.email, user]));
  for (const email of cognitoEmails) {
    if (!usersByEmail.has(email)) {
      usersByEmail.set(email, { email, quota: config.defaultWeeklyQuota, adminOffices: [] });
    }
  }
  return Array.from(usersByEmail.values());
};

const getAllData = async (config: Config): Promise<Backup> => {
  const [bookings, dbUsers, cognitoEmails] = await Promise.all([
    getAllBookings(config),
    getAllUsers(config),
    getAllCognitoUserEmails(config),
  ]);

  return {
    bookings: mapBookings(config, bookings),
    users: mergeUserSets(config, dbUsers, cognitoEmails).map((user) => makeUser(config, user)),
  };
};

const backup = async () => {
  const config = parseConfigFromEnv(process.env);
  const data = await getAllData(config);
  writeFileSync(
    `office-booker-backup-${new Date().toISOString().replace(/[^\d]*/, '_')}.json`,
    JSON.stringify(data)
  );
};

backup().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
