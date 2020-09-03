import React, { useContext, useState, useEffect } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import Paper from '@material-ui/core/Paper';
import format from 'date-fns/format';
import parse from 'date-fns/parse';

import { AppContext } from '../../AppProvider';

import AdminLayout from './Layout/Layout';
import Loading from '../../Assets/LoadingSpinner';

import { getUser, getBookings } from '../../../lib/api';
import { formatError } from '../../../lib/app';
import { User, Booking } from '../../../types/api';

import { DATE_FNS_OPTIONS } from '../../../constants/dates';
import UserBookingsStyles from './UserBookings.styles';

// Component
const UserBookings: React.FC<RouteComponentProps<{ email: string }>> = (props) => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user } = state;

  // Local state
    const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [bookings, setBookings] = useState<Booking[] | undefined>();

  // Effects
  useEffect(() => {
    if (state.user) {
      getBookings({ user: state.user.email })
        .then((data) => {
          // Split for previous and upcoming
          setBookings(data);
        })
        .catch((err) => {
          // Handle errors
            setLoading(false);

          dispatch({
            type: 'SET_ALERT',
            payload: {
              message: formatError(err),
              color: 'error',
            },
          });
        });
    }
  }, [state.user, dispatch]);

  useEffect(() => {
    if (user && !user.permissions.canViewUsers) {
      // No permissions - Bounce to home page
      navigate('/');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Get selected user
      getUser(props.email || '')
        .then((selectedUser) => setSelectedUser(selectedUser))
        .catch((err) => {
          // Handle errors
            setLoading(false);

          dispatch({
            type: 'SET_ALERT',
            payload: {
              message: formatError(err),
              color: 'error',
            },
          });
        });
    }
  }, [user, props.email, dispatch]);

    
  useEffect(() => {
    if (bookings) {
      // Wait for global state to be ready
      setLoading(false);
    }
  }, [bookings]);  
    
  // Render
  if (!user) {
    return null;
  }

  return (
    <AdminLayout currentRoute="users">
      <UserBookingsStyles>
        {loading || !selectedUser ? (
          <Loading />
        ) : (
          <>
            <h3>User Bookings</h3>

            <Paper square className="form-container">
              <h4>Bookings for {selectedUser.email}</h4>
              <section className="user-bookings">
                {bookings && bookings.length > 0 && (
                  <>
                    <ul className="bookings-list">
                      {bookings.map((row) => (
                        <li key={row.id} className="booking-list-item">
                          {format(
                            parse(row.date, 'yyyy-MM-dd', new Date(), DATE_FNS_OPTIONS),
                            'do LLLL',
                            DATE_FNS_OPTIONS
                          )}
                          {` `}
                          <span>at {row.office}</span>
                          {` `}
                          <span>{row.parking ? '(+ Parking)' : ''}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            </Paper>
          </>
        )}
      </UserBookingsStyles>
    </AdminLayout>
  );
};

export default UserBookings;
