import React, { useContext, useState, useEffect } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
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
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import CreateIcon from '@material-ui/icons/Create';
import SearchIcon from '@material-ui/icons/Search';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import IconButton from '@material-ui/core/IconButton';

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
  role: 'all' | 'System Admin' | 'Office Admin';
  customQuota: boolean;
  email?: string;
};

// Helpers
const userFilterToQuery = (filter: UserFilter): UserQuery => {
  const query: UserQuery = { emailPrefix: filter.email };

  if (filter.role === 'Office Admin') {
    query.role = 'Office Admin';
  } else if (filter.role === 'System Admin') {
    query.role = 'System Admin';
  }

  if (filter.customQuota) {
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
  const [paginationToken, setPaginationToken] = useState<string | undefined>();
  const [selectedFilter, setSelectedFilter] = useState<UserFilter>({
    role: 'all',
    customQuota: false,
  });
  const [email, setEmail] = useState<string>('');

  // Effects
  useEffect(() => {
    // Retrieve results
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

  useEffect(() => {
    // Search after typing has stopped
    const sanitisedEmail = email.trim().toLowerCase();

    const searchEmailTimer = setTimeout(() => {
      setSelectedFilter((filter) => ({
        ...filter,
        email: sanitisedEmail,
      }));
    }, 1000);

    // Cleanup
    return () => clearTimeout(searchEmailTimer);
  }, [email]);

  // Handlers
  const handleRoleFilter = (e: React.ChangeEvent<{ value: unknown }>) => {
    const role = e.target.value as string;

    if (role === 'all' || role === 'System Admin' || role === 'Office Admin') {
      setSelectedFilter((filter) => ({ ...filter, role }));
    }
  };

  const loadMore = () => {
    if (paginationToken && selectedFilter.role === 'all') {
      // Clear the current token
      setPaginationToken(undefined);

      // Retrieve data after pagination token
      queryUsers({}, paginationToken)
        .then((result) => {
          // Merge new results with existing
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
        {loading ? (
          <Loading />
        ) : (
          <>
            <h3>Users</h3>

            <OurButton
              startIcon={<AddCircleIcon />}
              type="submit"
              color="secondary"
              onClick={() => {}}
              variant="contained"
              size="small"
            >
              New user
            </OurButton>

            <Paper square className="table-container">
              <section className="filters">
                <div className="filter-roles">
                  <FormControl>
                    <InputLabel>User Role</InputLabel>
                    <Select value={selectedFilter.role} onChange={handleRoleFilter}>
                      <MenuItem value="all">All Registered Users</MenuItem>
                      <MenuItem value="System Admin">System Admins</MenuItem>
                      <MenuItem value="Office Admin">Office Admins</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                <div className="filter-quota">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedFilter.customQuota}
                        onChange={(_, checked) =>
                          setSelectedFilter((filter) => ({ ...filter, customQuota: checked }))
                        }
                      />
                    }
                    label="Custom quota?"
                    labelPlacement="start"
                  />
                </div>

                <div className="search-user">
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
                </div>
              </section>

              <TableContainer className="table">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className="table-header">User Email</TableCell>
                      <TableCell className="table-header">Quota</TableCell>
                      <TableCell className="table-header">Role</TableCell>
                      <TableCell className="table-header" />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {queryResult && queryResult.length > 0 ? (
                      queryResult.map((user) => (
                        <TableRow key={user.email}>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.quota}</TableCell>
                          <TableCell>{user.role.name}</TableCell>
                          <TableCell align="right">
                            <IconButton onClick={() => navigate(`/admin/users/${user.email}`)}>
                              <CreateIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell>No users found</TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {paginationToken && (
                <section className="load-more-container">
                  <OurButton onClick={loadMore} color="primary" variant="contained">
                    Load More
                  </OurButton>
                </section>
              )}

              {selectedFilter.role === 'all' &&
                selectedFilter.email !== undefined &&
                validateEmail(state.config?.emailRegex, selectedFilter.email) &&
                queryResult?.length === 0 && (
                  <section className="unregistered-user">
                    <p>
                      User <span>{selectedFilter.email}</span> not yet registered
                    </p>

                    <OurButton
                      startIcon={<AddCircleIcon />}
                      type="submit"
                      variant="contained"
                      color="primary"
                      onClick={() => navigate(`/admin/users/${selectedFilter.email}`)}
                      size="small"
                    >
                      Add user
                    </OurButton>
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
