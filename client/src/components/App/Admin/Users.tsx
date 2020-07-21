import React, { useContext, useState, useEffect } from 'react';
import { RouteComponentProps, Link } from '@reach/router';

import Layout from '../../Layout/Layout';
import ManageUsersStyles from './ManageUsers.styles';
import AdminHeader from './AdminHeader';
import AdminStyles from './Admin.styles';
import { AppContext } from '../../AppProvider';

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

import { User, UserQuery } from '../../../types/api';
import { queryUsers } from '../../../lib/api';
import { formatError } from '../../../lib/app';
import { OurButton } from '../../../styles/MaterialComponents';

type UserFilter = { name: 'System Admin' | 'Office Admin' | 'custom' | 'all'; email?: string };

const userFilterToQuery = (filter: UserFilter): UserQuery => {
  const query: UserQuery = { emailPrefix: filter.email };
  if (filter.name === 'Office Admin') {
    query.role = 'Office Admin';
  } else if (filter.name === 'System Admin') {
    query.role = 'System Admin';
  }
  if (filter.name === 'custom') {
    query.quota = 'custom';
  }
  return query;
};

const Users: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user } = state;
  const [queryResult, setQueryResult] = useState<User[] | undefined>(undefined);
  const [paginationToken, setPaginationToken] = useState<string | undefined>(undefined);
  const [selectedFilter, setSelectedFilter] = useState<UserFilter>({ name: 'System Admin' });
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    queryUsers(userFilterToQuery(selectedFilter))
      .then((result) => {
        setQueryResult(result.users);
        setPaginationToken(result.paginationToken);
      })
      .catch((error) =>
        dispatch({
          type: 'SET_ERROR',
          payload: formatError(error),
        })
      );
  }, [selectedFilter, dispatch]);

  const handleSelectedRoleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const val = event.target.value;
    if (val === 'System Admin' || val === 'Office Admin' || val === 'custom' || val === 'all') {
      setSelectedFilter({ name: val });
    }
  };

  const loadMore = () => {
    if (paginationToken && selectedFilter.name === 'all') {
      setPaginationToken(undefined);
      queryUsers({}, paginationToken)
        .then((result) => {
          setQueryResult((previousUsers) => [...(previousUsers ?? []), ...result.users]);
          setPaginationToken(result.paginationToken);
        })
        .catch((error) =>
          dispatch({
            type: 'SET_ERROR',
            payload: formatError(error),
          })
        );
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
                  <div className="filter-roles">
                    <FormControl variant="outlined">
                      <InputLabel style={{ backgroundColor: '#ffffff' }}>Select Filter</InputLabel>
                      <Select value={selectedFilter.name} onChange={handleSelectedRoleChange}>
                        <MenuItem value={'System Admin'}>System Admins</MenuItem>
                        <MenuItem value={'Office Admin'}>Office Admins</MenuItem>
                        <MenuItem value={'custom'}>Users with Custom Quota</MenuItem>
                        <MenuItem value={'all'}>All Registered Users</MenuItem>
                      </Select>
                    </FormControl>
                  </div>

                  <div className="search-user">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const sanitisedEmail = email.trim().toLowerCase();
                        setSelectedFilter((filter) => ({
                          ...filter,
                          email: sanitisedEmail === '' ? undefined : sanitisedEmail,
                        }));
                      }}
                    >
                      <TextField
                        placeholder="Start of email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                {paginationToken && (
                  <section className="load-more-container">
                    <OurButton onClick={loadMore} variant="contained">
                      Load More
                    </OurButton>
                  </section>
                )}
              </Paper>
            </ManageUsersStyles>
          </>
        )}
      </AdminStyles>
    </Layout>
  );
};

export default Users;
