import React from 'react';
import { navigate } from '@reach/router';

import styled from 'styled-components';
import { TabButton } from '../../../styles/MaterialComponents';

type Props = { currentRoute?: 'manage' | 'home' };

// Style
export const AdminHeaderStyles = styled.div`
  background-color: #efefef;
  min-height: 15rem;
  position: relative;

  ${(props) => props.theme.breakpoints.up('xs')} {
    padding: 2rem 2rem 0;
  }

  ${(props) => props.theme.breakpoints.up('sm')} {
    padding: 3rem 3rem 0;
  }

  h2 {
    color: ${(props) => props.theme.palette.primary.main};
    font-size: 2.4rem;
    font-weight: 400;
  }

  .btns {
    position: absolute;
    bottom: 0;
  }
`;

const AdminHeader: React.FC<Props> = ({ currentRoute }: Props) => (
  <AdminHeaderStyles>
    <h2>Admin</h2>
    <div className="btns">
      <TabButton
        className={currentRoute === 'home' ? 'current' : ''}
        variant="contained"
        onClick={() => navigate(`/admin/`)}
      >
        Booking
      </TabButton>
      <TabButton
        className={currentRoute === 'manage' ? 'current' : ''}
        variant="contained"
        onClick={() => navigate(`/admin/users`)}
      >
        Manage Users
      </TabButton>
    </div>
  </AdminHeaderStyles>
);

export default AdminHeader;
