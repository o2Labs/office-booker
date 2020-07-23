import React, { useContext } from 'react';

import { AppContext } from '../../../AppProvider';

import Layout from '../../../Layout/Layout';
import Header from './Header';

import AdminLayoutStyles from './Layout.styles';

const Admin: React.FC = (props) => {
  // Global state
  const { state } = useContext(AppContext);
  const { user } = state;

  // Render
  if (!user) {
    return null;
  }

  return (
    <Layout>
      <AdminLayoutStyles>
        {!user.permissions.canViewAdminPanel ? (
          <div className="redirect">
            <h2>Only for admins</h2>
            <p>You don&apos;t have an access to view this page, redirecting you to home...</p>
          </div>
        ) : (
          <>
            <Header currentRoute="home" />
            {props.children}
          </>
        )}
      </AdminLayoutStyles>
    </Layout>
  );
};

export default Admin;
