import { Config } from '../src/context/stores';
import { Booking, Office, User } from '../src/types/api';
import { format } from 'date-fns';

export const createFakeConfig = (prototype?: Partial<Config>): Config => ({
  advancedBookingDays: 14,
  auth: { type: 'test' },
  showTestBanner: false,
  ...prototype,
});

export const createFakeOffice = (prototype?: Partial<Office>): Office => ({
  id: 'the-office',
  name: 'The Office',
  parkingQuota: 100,
  quota: 100,
  ...prototype,
});

export const createFakeUser = (prototype?: Partial<User>): User => ({
  email: 'mock.user@domain.test',
  permissions: {
    canEditUsers: false,
    canManageAllBookings: false,
    canViewAdminPanel: false,
    canViewUsers: false,
    officesCanManageBookingsFor: [],
  },
  quota: 5,
  role: { name: 'Default' },
  ...prototype,
});

export const createFakeSystemAdminUser = (
  allOffices: Office[],
  prototype?: Partial<User>
): User => ({
  email: 'mock.user@domain.test',
  permissions: {
    canEditUsers: true,
    canManageAllBookings: true,
    canViewAdminPanel: true,
    canViewUsers: true,
    officesCanManageBookingsFor: allOffices,
  },
  quota: 5,
  role: { name: 'System Admin' },
  ...prototype,
});

export const createFakeOfficeAdminUser = (
  officesCanManageBookingsFor: Office[],
  prototype?: Partial<User>
): User => ({
  email: 'mock.user@domain.test',
  permissions: {
    canEditUsers: false,
    canManageAllBookings: false,
    canViewAdminPanel: true,
    canViewUsers: true,
    officesCanManageBookingsFor,
  },
  quota: 5,
  role: { name: 'Office Admin', offices: officesCanManageBookingsFor },
  ...prototype,
});

export const createFakeBooking = (
  prototype: Partial<Booking> & Pick<Booking, 'office'>
): Booking => ({
  date: format(new Date(), 'yyyy-MM-dd'),
  id: 'booking',
  parking: true,
  user: 'user',
  ...prototype,
});
