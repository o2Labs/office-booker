import React, { useContext, useState, useEffect } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';

import Layout from '../../Layout/Layout';
import Loading from '../../Assets/LoadingSpinner';

import { AppContext } from '../../AppProvider';
import { getUser, putUser, getOffices } from '../../../lib/api';
import { formatError } from '../../../lib/app';

import { User, Office } from '../../../types/api';
import {
  TextField,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Breadcrumbs,
  Input,
  Chip,
} from '@material-ui/core';
import { OurButton } from '../../../styles/MaterialComponents';
import AdminHeader from './AdminHeader';
import AdminStyles from './Admin.styles';
import ManageUsersStyles from './ManageUsers.styles';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

type UserRole = { name: 'System Admin' | 'Office Admin' | 'Default' };

const UserAdmin: React.FC<RouteComponentProps<{ email: string }>> = (props) => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const currentUser = state.user;
  const canEdit = currentUser?.permissions.canEditUsers === true;

  // Local state
  const [user, setUser] = useState<User | undefined>();
  const [offices, setOffices] = useState<Office[] | undefined>();

  // Effects
  useEffect(() => {
    if (!currentUser?.permissions.canViewUsers) {
      setTimeout(() => {
        // Bounce to home page
        navigate('/');
      }, 3000);
    } else {
      getOffices()
        .then((o) => setOffices(o))
        .catch((error) => {
          dispatch({
            type: 'SET_ERROR',
            payload: formatError(error),
          });
        });

      getUser(props.email || '')
        .then((user) => {
          setUser(user);
        })
        .catch((error) => {
          dispatch({
            type: 'SET_ERROR',
            payload: formatError(error),
          });
        });
    }
  }, [props.email, currentUser, dispatch]);

  const saveChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (user === undefined) {
      return;
    }
    try {
      const role = user.role.name === 'System Admin' ? undefined : user.role;
      const updatedUser = await putUser({ email: user.email, quota: user.quota, role });
      setUser(updatedUser);
      dispatch({
        type: 'SET_ALERT',
        payload: {
          message: `Quota for ${updatedUser.email} is now ${updatedUser.quota}`,
          color: 'success',
        },
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: formatError(error),
        color: 'success',
      });
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Layout>
      <AdminStyles>
        {!currentUser.permissions.canViewUsers ? (
          <div className="redirect">
            <h2>Only for admins</h2>
            <p>You don&apos;t have an accesss to view this page, redirecting you to home...</p>
          </div>
        ) : user === undefined || offices === undefined ? (
          <Loading />
        ) : (
          <>
            <AdminHeader currentRoute={'manage'} />
            <ManageUsersStyles>
              <Paper>
                <Breadcrumbs
                  separator={<NavigateNextIcon fontSize="small" />}
                  aria-label="breadcrumb"
                >
                  <h3 className="breadcrumb-text previous"> Manage Users</h3>

                  <h3 className="breadcrumb-text ">Edit User</h3>
                </Breadcrumbs>
                <section className="edit-user">
                  <form onSubmit={saveChange}>
                    <p className="user-email-tt"> {user.email}</p>
                    <div className="role-container">
                      <h3>Role</h3>
                      <FormControl variant="outlined">
                        <InputLabel style={{ backgroundColor: '#ffffff' }}>Select Role</InputLabel>
                        <Select
                          value={user.role.name}
                          disabled={user.role.name === 'System Admin' || !canEdit}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setUser((user) => {
                              if (user === undefined) {
                                return;
                              }
                              if (newValue === 'Default') {
                                return { ...user, role: { name: 'Default' } };
                              } else if (newValue === 'Office Admin') {
                                return { ...user, role: { name: 'Office Admin', offices: [] } };
                              }
                              return user;
                            });
                          }}
                        >
                          <MenuItem value={'Default'}>Default</MenuItem>
                          <MenuItem value={'Office Admin'}>Office Admin</MenuItem>
                          <MenuItem value={'System Admin'} disabled>
                            System Admin
                          </MenuItem>
                        </Select>
                      </FormControl>
                      {user.role.name === 'Office Admin' && (
                        <FormControl>
                          <InputLabel id="demo-mutiple-chip-label">Select Offices</InputLabel>
                          <Select
                            className="chips-select"
                            multiple
                            disabled={!canEdit}
                            value={user.role.name === 'Office Admin' ? user.role.offices : []}
                            onChange={(e) => {
                              const newValue = e.target.value as string[];

                              setUser((user) => {
                                if (user === undefined) {
                                  return;
                                }
                                return {
                                  ...user,
                                  role: { name: 'Office Admin', offices: newValue },
                                };
                              });
                            }}
                            input={<Input id="select-multiple-chip" />}
                            renderValue={(selected) => (
                              <div>
                                {(selected as string[]).map((value) => (
                                  <Chip key={value} label={value} />
                                ))}
                              </div>
                            )}
                            error={user.role.offices.length === 0}
                          >
                            {offices.map((office) => (
                              <MenuItem key={office.name} value={office.name}>
                                {office.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </div>
                    <h3>Allocated Quota </h3>
                    <TextField
                      type="number"
                      variant="outlined"
                      disabled={!canEdit}
                      label="Select Quota"
                      value={user.quota}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setUser((user) => user && { ...user, quota: Number.parseInt(newValue) });
                      }}
                      error={user.quota < 0}
                    />

                    {canEdit && (
                      <div className="buttons">
                        <OurButton
                          type="submit"
                          color="primary"
                          variant="contained"
                          disabled={user.quota < 0}
                        >
                          Save
                        </OurButton>
                      </div>
                    )}
                  </form>
                </section>
                <section className="docs">
                  <h2>About Roles</h2>

                  <h3>Default</h3>
                  <ul>
                    <li>Any user with a valid email address gets this role.</li>
                    <li>Can manage their own bookings only.</li>
                  </ul>
                  <h3>System Admin</h3>
                  <ul>
                    <li>Must be configured in infrastructure.</li>
                    <li>Can view and edit all bookings in the system.</li>
                    <li>Can view and edit all users</li>
                  </ul>
                  <h3>Office Admin</h3>
                  <ul>
                    <li>Must be assigned by a System Admin.</li>
                    <li>Can view and edit bookings for their assigned offices.</li>
                    <li>Can view other users (but can't edit).</li>
                  </ul>
                  <p>Quotas are applied to all users regardless of role.</p>
                </section>
              </Paper>
            </ManageUsersStyles>
          </>
        )}
      </AdminStyles>
    </Layout>
  );
};

export default UserAdmin;
