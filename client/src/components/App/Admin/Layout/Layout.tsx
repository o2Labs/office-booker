import React, { useContext } from 'react';

import { AppContext } from '../../../AppProvider';

import Layout from '../../../Layout/Layout';
import Header, { Routes } from './Header';

import AdminLayoutStyles from './Layout.styles';

// Types
type Props = {
  currentRoute: Routes;
};

// Component
const Admin: React.FC<Props> = (props) => {
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
            <Header currentRoute={props.currentRoute} />
            {props.children}
          </>
        )}
      </AdminLayoutStyles>
    </Layout>
  );
};

export default Admin;
