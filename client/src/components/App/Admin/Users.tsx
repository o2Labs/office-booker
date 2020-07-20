import React, { useContext, useState, useEffect } from 'react';
import { RouteComponentProps, Link } from '@reach/router';

import Layout from '../../Layout/Layout';
import ManageUsersStyles from './ManageUsers.styles';
import AdminHeader from './AdminHeader';
import AdminStyles from './Admin.styles';
import { AppContext } from '../../AppProvider';
import { validateEmail } from '../../../lib/emailValidation';

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from '@material-ui/core';
import Create from '@material-ui/icons/Create';
import { TextField, InputAdornment } from '@material-ui/core';
import Search from '@material-ui/icons/Search';

import { User } from '../../../types/api';
import { queryUsers, getUser } from '../../../lib/api';
import { formatError } from '../../../lib/app';

type UserFilter =
  | { name: 'System Admin' | 'Office Admin' | 'custom' }
  | { name: 'email'; email: string };

const Users: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user } = state;
  const [queryResult, setQueryResult] = useState<User[] | undefined>(undefined);
  const [selectedFilter, setSelectedFilter] = useState<UserFilter>({ name: 'System Admin' });
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (selectedFilter.name === 'email') {
      getUser(selectedFilter.email)
        .then((user) => {
          setQueryResult([user]);
        })
        .catch((error) => {
          dispatch({
            type: 'SET_ERROR',
            payload: formatError(error),
          });
        });
    } else {
      queryUsers(
        selectedFilter.name === 'custom' ? { quota: 'custom' } : { role: selectedFilter.name }
      )
        .then((result) => setQueryResult(result.users))
        .catch((error) =>
          dispatch({
            type: 'SET_ERROR',
            payload: formatError(error),
          })
        );
    }
  }, [selectedFilter, dispatch]);

  useEffect(() => {
    if (email.length > 0 && !validateEmail(state.config?.emailRegex, email)) {
      setEmailError('Email address not permitted');
    } else {
      setEmailError(undefined);
    }
  }, [email, state.config]);

  const handleSelectedRoleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const val = event.target.value;
    if (val === 'System Admin' || val === 'Office Admin' || val === 'custom') {
      setSelectedFilter({ name: val });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <AdminStyles>
        {!user.permissions.canViewUsers ? (
          <div className="redirect">
            <h2>Only for admins</h2>
            <p>You don&apos;t have an access to view this page, redirecting you to home...</p>
          </div>
        ) : (
          <>
            <AdminHeader currentRoute={'manage'} />
            <ManageUsersStyles>
              <Paper>
                <h3>View Users</h3>
                <section className="filters">
                  <div className="search-user">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (email && !emailError) {
                          setSelectedFilter({ name: 'email', email });
                        } else {
                          setSelectedFilter({ name: 'System Admin' });
                        }
                      }}
                    >
                      <TextField
                        placeholder="search by full email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={emailError !== undefined}
                        helperText={emailError}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </form>
                  </div>

                  <div className="filter-roles">
                    <FormControl variant="outlined">
                      <InputLabel style={{ backgroundColor: '#ffffff' }}>Select Filter</InputLabel>
                      <Select value={selectedFilter.name} onChange={handleSelectedRoleChange}>
                        <MenuItem value={'System Admin'}>System Admins</MenuItem>
                        <MenuItem value={'Office Admin'}>Office Admins</MenuItem>
                        <MenuItem value={'custom'}>Users with Custom Quota</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </section>

                <section className="listing-container">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User Email</TableCell>
                        <TableCell>Quota</TableCell>
                        <TableCell>Role</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!queryResult
                        ? null
                        : queryResult.map((user) => (
                            <TableRow key={user.email}>
                              <TableCell>
                                <Link to={`/admin/users/${user.email}`}>
                                  {user.email} <Create />
                                </Link>
                              </TableCell>
                              <TableCell>{user.quota}</TableCell>
                              <TableCell>{user.role.name}</TableCell>
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                </section>
              </Paper>
            </ManageUsersStyles>
          </>
        )}
      </AdminStyles>
    </Layout>
  );
};

export default Users;
