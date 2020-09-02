export type UserWeeklyBooking = {
  commencing: string;
  booked: number;
};

export type Office = {
  id: string;
  name: string;
  quota: number;
  parkingQuota: number;
};

export type DefaultRole = { name: 'Default' };
export type SystemAdminRole = { name: 'System Admin' };
export type OfficeAdminRole = { name: 'Office Admin'; offices: Office[] };
export type UserRole = DefaultRole | SystemAdminRole | OfficeAdminRole;

export type UserQuery = { quota?: 'custom'; role?: UserRole['name']; emailPrefix?: string };

export type UserQueryResponse = { users: User[]; paginationToken?: string };

export type User = {
  email: string;
  quota: number;
  role: UserRole;
  permissions: {
    canViewAdminPanel: boolean;
    canViewUsers: boolean;
    canEditUsers: boolean;
    canManageAllBookings: boolean;
    officesCanManageBookingsFor: Office[];
  };
};

export type OfficeSlot = {
  date: string;
  booked: number;
  bookedParking: number;
};

export type OfficeWithSlots = Office & {
  slots: OfficeSlot[];
};

export type Booking = {
  id: string;
  user: User['email'];
  date: string;
  office: Office;
  parking: boolean;
};
