import { Config } from './app-config';
import { getVisibleDates } from './dates';
import { getOfficeBookings } from './db/officeBookings';
import { User } from './users/model';

type OfficeDateStats = {
  officeId: string;
  date: string;
  bookingCount: number;
  parkingCount: number;
};

export type Stats = {
  officeDates: OfficeDateStats[];
};

export const getStats = async (config: Config, user: User): Promise<Stats> => {
  const dates = getVisibleDates(config);
  const officeDates: OfficeDateStats[] = [];
  for (const office of user.permissions.officesCanManageBookingsFor) {
    const officeBookings = await getOfficeBookings(config, office.id, dates);
    for (const bookingDate of officeBookings) {
      officeDates.push({
        officeId: bookingDate.name,
        date: bookingDate.date,
        bookingCount: bookingDate.bookingCount,
        parkingCount: bookingDate.parkingCount,
      });
    }
  }
  return { officeDates };
};
