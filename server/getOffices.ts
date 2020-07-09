import { getOfficeBookings } from './db/officeBookings';
import { getAvailableDates } from './availableDates';
import { Config } from './app-config';

export const getOfficeId = (officeName: string): string => {
  const lowered = officeName.toLowerCase();
  return lowered.replace(/[^a-z0-9]/gi, '');
};

const officeIdPattern = new RegExp('^[a-z0-9-]+$').compile();
export const isValidOfficeId = (officeId: string): boolean => officeIdPattern.test(officeId);

export const getOffices = async (config: Config) => {
  const availableDates = getAvailableDates(config);
  const officeBookings = await getOfficeBookings(
    config,
    availableDates,
    config.officeQuotas.map((office) => office.name)
  );
  const indexedBookings = new Map(
    officeBookings.map((officeBooking) => [
      officeBooking.name + officeBooking.date,
      officeBooking.bookingCount,
    ])
  );
  const combined = config.officeQuotas.map((office) => ({
    name: office.name,
    quota: office.quota,
    parkingQuota: office.parkingQuota,
    slots: availableDates.map((date) => ({
      date,
      booked: indexedBookings.get(office.name + date) || 0,
    })),
  }));
  return combined;
};
