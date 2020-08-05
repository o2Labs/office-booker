import React from 'react';
import { Link } from '@reach/router';

import AdminHeaderStyles from './Header.styles';

// Types
export type Routes = 'bookings' | 'users';

type Props = {
  currentRoute: Routes;
};

// Component
const AdminHeader: React.FC<Props> = ({ currentRoute }) => (
  <AdminHeaderStyles>
    <h2>Admin</h2>

    <div className="btns">
      <Link to="/admin" className={currentRoute === 'bookings' ? 'current' : ''}>
        Bookings
      </Link>
      <Link to="/admin/users" className={currentRoute === 'users' ? 'current' : ''}>
        Users
      </Link>
    </div>
  </AdminHeaderStyles>
);

export default AdminHeader;
