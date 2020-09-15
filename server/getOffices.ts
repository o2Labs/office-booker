import { getOfficeBookings } from './db/officeBookings';
import { getAvailableDates } from './availableDates';
import { Config } from './app-config';
import { NotFound } from './errors';

export const getOfficeId = (officeName: string): string => {
  const lowered = officeName.toLowerCase();
  return lowered.replace(/[^a-z0-9]/gi, '');
};

const officeIdPattern = new RegExp('^[a-z0-9-]+$').compile();
export const isValidOfficeId = (officeId: string): boolean => officeIdPattern.test(officeId);

export const getOffice = async (config: Config, officeId: string) => {
  const availableDates = getAvailableDates(config);
  const office = config.officeQuotas.find((o) => o.id === officeId);
  if (office === undefined) {
    throw new NotFound();
  }
  const officeBookings = await getOfficeBookings(config, office.id, availableDates);
  const indexedBookings = new Map(
    officeBookings.map((officeBooking) => [officeBooking.date, officeBooking])
  );
  const combined = {
    id: office.id,
    name: office.name,
    quota: office.quota,
    parkingQuota: office.parkingQuota,
    slots: availableDates.map((date) => {
      const booking = indexedBookings.get(date);
      return {
        date,
        booked: booking?.bookingCount ?? 0,
        bookedParking: booking?.parkingCount ?? 0,
      };
    }),
  };
  return combined;
};
