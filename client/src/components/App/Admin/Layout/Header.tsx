import React from 'react';
import { navigate } from '@reach/router';

import { TabButton } from '../../../../styles/MaterialComponents';

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
      <TabButton
        className={currentRoute === 'bookings' ? 'current' : ''}
        color={currentRoute === 'bookings' ? 'secondary' : 'default'}
        size="small"
        onClick={() => navigate(`/admin/`)}
      >
        Bookings
      </TabButton>

      <TabButton
        className={currentRoute === 'users' ? 'current' : ''}
        color={currentRoute === 'users' ? 'secondary' : 'default'}
        size="small"
        onClick={() => navigate(`/admin/users`)}
      >
        Users
      </TabButton>
    </div>
  </AdminHeaderStyles>
);

export default AdminHeader;
