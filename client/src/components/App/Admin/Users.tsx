import React, { useContext, useState, useEffect } from 'react';
import { RouteComponentProps, Link } from '@reach/router';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Paper from '@material-ui/core/Paper';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputAdornment from '@material-ui/core/InputAdornment';
import CreateIcon from '@material-ui/icons/Create';
import SearchIcon from '@material-ui/icons/Search';

import { AppContext } from '../../AppProvider';
import Loading from '../../Assets/LoadingSpinner';

import AdminLayout from './Layout/Layout';
import { OurButton } from '../../../styles/MaterialComponents';

import { validateEmail } from '../../../lib/emailValidation';
import { User, UserQuery } from '../../../types/api';
import { queryUsers } from '../../../lib/api';
import { formatError } from '../../../lib/app';

import UsersStyles from './Users.styles';

// Types
type UserFilter = {
  name: 'System Admin' | 'Office Admin' | 'custom' | 'all';
  email?: string;
};

// Helpers
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

// Component
const Users: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user } = state;

  // Local state
  const [loading, setLoading] = useState(true);
  const [queryResult, setQueryResult] = useState<User[] | undefined>(undefined);
  const [paginationToken, setPaginationToken] = useState<string | undefined>(undefined);
  const [selectedFilter, setSelectedFilter] = useState<UserFilter>({ name: 'System Admin' });
  const [email, setEmail] = useState<string>('');

  // Effects
  useEffect(() => {
    queryUsers(userFilterToQuery(selectedFilter))
      .then((result) => {
        setQueryResult(result.users);
        setPaginationToken(result.paginationToken);
      })
      .catch((err) => {
        // Handle errors
        setLoading(false);

        dispatch({
          type: 'SET_ERROR',
          payload: formatError(err),
        });
      });
  }, [selectedFilter, dispatch]);

  useEffect(() => {
    if (queryResult) {
      // Wait for local state to be ready
      setLoading(false);
    }
  }, [queryResult]);

  // Handlers
  const handleSelectedRoleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const val = event.target.value;
    if (val === 'System Admin' || val === 'Office Admin' || val === 'custom' || val === 'all') {
      setSelectedFilter((filter) => ({ ...filter, name: val }));
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

  // Render
  if (!user) {
    return null;
  }

  return (
    <AdminLayout currentRoute="users">
      <UsersStyles>
        {' '}
        {loading ? (
          <Loading />
        ) : (
          <>
            <h3>Users</h3>

            <Paper square className="table-container">
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
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </form>
                </div>
              </section>

              <TableContainer className="table">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User Email</TableCell>
                      <TableCell>Quota</TableCell>
                      <TableCell>Role</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {queryResult && queryResult.length > 0 ? (
                      queryResult.map((user) => (
                        <TableRow key={user.email}>
                          <TableCell>
                            <Link to={`/admin/users/${user.email}`}>
                              {user.email} <CreateIcon />
                            </Link>
                          </TableCell>
                          <TableCell>{user.quota}</TableCell>
                          <TableCell>{user.role.name}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell>No users found</TableCell>
                        <TableCell />
                        <TableCell />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {paginationToken && (
                <section className="load-more-container">
                  <OurButton onClick={loadMore} variant="contained">
                    Load More
                  </OurButton>
                </section>
              )}

              {selectedFilter.name === 'all' &&
                selectedFilter.email !== undefined &&
                validateEmail(state.config?.emailRegex, selectedFilter.email) &&
                queryResult?.length === 0 && (
                  <section className="unregistered-user">
                    <p>
                      User not yet registered, edit{' '}
                      <Link to={`/admin/users/${selectedFilter.email}`}>
                        {selectedFilter.email}
                        <CreateIcon />
                      </Link>{' '}
                      anyway.
                    </p>
                  </section>
                )}
            </Paper>
          </>
        )}
      </UsersStyles>
    </AdminLayout>
  );
};

export default Users;
