import React, { useContext } from 'react';
import { RouteComponentProps } from '@reach/router';

import { AppContext } from '../../AppProvider';

import Layout from '../../Layout/Layout';
import AdminHeader from './Layout/Header';
import Bookings from './Bookings';

import AdminStyles from './Admin.styles';

const Admin: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state } = useContext(AppContext);
  const { user } = state;

  // Render
  if (!user) {
    return null;
  }

  return (
    <Layout>
      <AdminStyles>
        {!user.permissions.canViewAdminPanel ? (
          <div className="redirect">
            <h2>Only for admins</h2>
            <p>You don&apos;t have an access to view this page, redirecting you to home...</p>
          </div>
        ) : (
          <>
            <AdminHeader currentRoute="home" />
            <Bookings />
          </>
        )}
      </AdminStyles>
    </Layout>
  );
};

export default Admin;
