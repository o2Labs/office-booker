import { Config } from '../app-config';
import { getAllBookings } from '../db/bookings';
import {
  BookingsModel,
  migrateBookings,
  getAllBookings as getAllMigratedBookings,
} from '../db/bookingsV2';

export const moveBookingsToV2 = async (config: Config) => {
  const officeNameToId = new Map(config.officeQuotas.map((o) => [o.name, o.id]));
  const getIdFromNameOrFail = (name: string) => {
    const id = officeNameToId.get(name);
    if (id === undefined) {
      throw new Error('Office ID not found for name ' + name);
    }
    return id;
  };
  const allBookings = await getAllBookings(config);
  const allMigratedBookings = await getAllMigratedBookings(config);
  const migratedBookingsById = new Set(allMigratedBookings.map((b) => b.id));
  const newBookings: BookingsModel[] = allBookings
    .filter((booking) => !migratedBookingsById.has(booking.id))
    .map((booking) => ({
      id: booking.id,
      created: booking.created,
      date: booking.date,
      parking: booking.parking,
      user: booking.user,
      ttl: booking.ttl,
      officeId: getIdFromNameOrFail(booking.office),
    }));
  await migrateBookings(config, newBookings);
};
