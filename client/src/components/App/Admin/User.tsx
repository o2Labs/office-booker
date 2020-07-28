import React, { useContext, useState, useEffect } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { AppContext } from '../../AppProvider';

import AdminLayout from './Layout/Layout';
import { OurButton } from '../../../styles/MaterialComponents';

import { getUser, putUser, getOffices } from '../../../lib/api';
import { formatError } from '../../../lib/app';
import { User, Office } from '../../../types/api';

import UserStyles from './User.styles';

// Component
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

  // TO DO:
  // Loading instead?
  if (!user || !offices) {
    return null;
  }

  return (
    <AdminLayout currentRoute="users">
      <UserStyles>
        <h3>Users</h3>

        <Paper square className="form-container">
          <h4>Edit user</h4>
          <h5>{user.email}</h5>

          <form onSubmit={saveChange}>
            <div className="field">
              <FormControl variant="outlined" className="input">
                <InputLabel id="role-label" shrink>
                  Role
                </InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  value={user.role.name}
                  disabled={user.role.name === 'System Admin' || !canEdit}
                  onChange={(e) => {
                    const { value } = e.target;

                    setUser((user) => {
                      if (user === undefined) {
                        return;
                      }

                      if (value === 'Default') {
                        return { ...user, role: { name: 'Default' } };
                      }

                      if (value === 'Office Admin') {
                        return { ...user, role: { name: 'Office Admin', offices: [] } };
                      }

                      return user;
                    });
                  }}
                  label="Role"
                >
                  <MenuItem value={'Default'}>Default</MenuItem>
                  <MenuItem value={'Office Admin'}>Office Admin</MenuItem>
                  <MenuItem value={'System Admin'} disabled>
                    System Admin
                  </MenuItem>
                </Select>
              </FormControl>
            </div>

            {user.role.name === 'Office Admin' && (
              <div className="field">
                <Autocomplete
                  multiple
                  disabled={!canEdit}
                  options={offices.map((o) => o.name)}
                  value={user.role.name === 'Office Admin' ? user.role.offices : []}
                  onChange={(_e, value) =>
                    setUser((user) => {
                      if (user === undefined) {
                        return;
                      }

                      return {
                        ...user,
                        role: { name: 'Office Admin', offices: value },
                      };
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Offices"
                      fullWidth={false}
                      className="input"
                    />
                  )}
                  renderTags={(selectedOffices, tagProps) =>
                    selectedOffices.map((office, index: number) => (
                      <Chip variant="outlined" label={office} {...tagProps({ index })} />
                    ))
                  }
                />
              </div>
            )}

            <div className="field">
              <TextField
                type="number"
                variant="outlined"
                disabled={!canEdit}
                label="Weekly quota"
                value={user.quota}
                onChange={(e) => {
                  // Between 0 and 7
                  const quota = Number.parseInt(e.target.value);

                  setUser(
                    (user) =>
                      user && {
                        ...user,
                        quota: quota >= 0 && quota <= 7 ? quota : quota > 7 ? 7 : 0,
                      }
                  );
                }}
                className="input"
              />
            </div>

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
        </Paper>

        <section className="help">
          <h3>About Roles</h3>

          <h4>Default</h4>

          <ul>
            <li>Any user with a valid email address gets this role.</li>
            <li>Can manage their own bookings only.</li>
          </ul>

          <h4>System Admin</h4>

          <ul>
            <li>Must be configured in infrastructure.</li>
            <li>Can view and edit all bookings in the system.</li>
            <li>Can view and edit all users</li>
          </ul>

          <h4>Office Admin</h4>

          <ul>
            <li>Must be assigned by a System Admin.</li>
            <li>Can view and edit bookings for their assigned offices.</li>
            <li>Can view other users (but can't edit).</li>
          </ul>

          <p>A default quota is applied to all users regardless of role.</p>
        </section>
      </UserStyles>
    </AdminLayout>
  );
};

export default UserAdmin;
