import { parseConfigFromEnv, Config } from '../app-config';
import { readFileSync } from 'fs';
import { Backup } from './backup';
import { User, getUser } from '../users/model';
import { setUser } from '../db/users';
import { Booking } from '../bookings/model';
import { getBooking } from '../db/bookings';
import { createBooking } from '../bookings/createBooking';
import yargs from 'yargs';

const args = yargs.options({
  path: { type: 'string', demandOption: true },
  user: { type: 'string', demandOption: true },
}).argv;

const restoreUsers = async (config: Config, users: User[]) => {
  for (const user of users) {
    await setUser(config, {
      email: user.email,
      quota: user.quota,
      // TODO: Update when we move the DB to use office IDs
      adminOffices: user.role.name === 'Office Admin' ? user.role.offices.map((o) => o.name) : [],
    });
  }
};

const restoreBookings = async (config: Config, restoreUser: User, bookings: Booking[]) => {
  for (const bookingToRestore of bookings) {
    const existingBooking = await getBooking(config, bookingToRestore.id, bookingToRestore.user);
    if (existingBooking === undefined) {
      await createBooking(config, restoreUser, {
        date: bookingToRestore.date,
        office: bookingToRestore.office,
        parking: bookingToRestore.parking,
        user: bookingToRestore.user,
        created: bookingToRestore.created,
      });
    }
  }
};

const restore = async () => {
  const config = parseConfigFromEnv(process.env);
  const allData = JSON.parse(readFileSync(args.path, { encoding: 'utf-8' })) as Backup;
  // TODO: Validate data matches schema
  const currentUser = await getUser(config, args.user);
  await restoreUsers(config, allData.users);
  await restoreBookings(config, currentUser, allData.bookings);
};

restore().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
