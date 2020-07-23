import React from 'react';
import { navigate } from '@reach/router';

import { TabButton } from '../../../../styles/MaterialComponents';

import AdminHeaderStyles from './Header.styles';

type Props = {
  currentRoute?: 'manage' | 'home';
};

const AdminHeader: React.FC<Props> = ({ currentRoute }: Props) => (
  <AdminHeaderStyles>
    <h2>Admin</h2>

    <div className="btns">
      <TabButton
        className={currentRoute === 'home' ? 'current' : ''}
        color={currentRoute === 'home' ? 'secondary' : 'default'}
        size="small"
        onClick={() => navigate(`/admin/`)}
      >
        Bookings
      </TabButton>

      <TabButton
        className={currentRoute === 'manage' ? 'current' : ''}
        color={currentRoute === 'manage' ? 'secondary' : 'default'}
        size="small"
        onClick={() => navigate(`/admin/users`)}
      >
        Users
      </TabButton>
    </div>
  </AdminHeaderStyles>
);

export default AdminHeader;
