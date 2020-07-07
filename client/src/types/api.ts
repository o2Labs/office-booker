export type UserWeeklyBooking = {
  commencing: string;
  booked: number;
};

export type DefaultRole = { name: 'Default' };
export type SystemAdminRole = { name: 'System Admin' };
export type OfficeAdminRole = { name: 'Office Admin'; offices: string[] };
export type UserRole = DefaultRole | SystemAdminRole | OfficeAdminRole;

type UserCustomQuotaQuery = { quota: 'custom' };
type UserRoleQuery = { role: UserRole['name'] };
export type UserQuery =
  | UserCustomQuotaQuery
  | UserRoleQuery
  | (UserCustomQuotaQuery & UserRoleQuery);

export type User = {
  email: string;
  quota: number;
  role: UserRole;
  permissions: {
    canViewAdminPanel: boolean;
    canViewUsers: boolean;
    canEditUsers: boolean;
    canManageAllBookings: boolean;
    officesCanManageBookingsFor: string[];
  };
};

export type OfficeSlot = {
  date: string;
  booked: number;
};

export type Office = {
  name: string;
  quota: number;
  slots: OfficeSlot[];
};

export type Booking = {
  id: string;
  user: User['email'];
  date: string;
  office: Office['name'];
};
