import { Config } from '../app-config';
import { getOfficeBookings, setOfficeBookings } from '../db/officeBookings';
import { getAvailableDates } from '../availableDates';

export const duplicateOfficeBooking = async (config: Config) => {
  const availableDates = getAvailableDates(config);
  const officeQuotas = config.officeQuotas;
  for (const office of officeQuotas) {
    console.log('Migrating ', office.name);
    const officeBookings = await getOfficeBookings(config, office.name, availableDates);
    const bookingsWithIds = officeBookings.map((booking) => ({ ...booking, name: office.id }));
    await setOfficeBookings(config, bookingsWithIds);
    console.log('Completed migrating ', office.name);
  }
};
