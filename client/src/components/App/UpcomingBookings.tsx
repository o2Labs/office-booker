import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import Paper from '@material-ui/core/Paper';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import isFuture from 'date-fns/isFuture';
import isBefore from 'date-fns/isBefore';
import startOfDay from 'date-fns/startOfDay';
import { AppContext } from '../AppProvider';

import LoadingSpinner from '../Assets/LoadingSpinner';
import { OurButton } from '../../styles/MaterialComponents';
import Layout from '../Layout/Layout';

import { getBookings } from '../../lib/api';
import { formatError } from '../../lib/app';
import { DATE_FNS_OPTIONS } from '../../constants/dates';

import UpcomingBookingsStyles from './UpcomingBookings.styles';

const UpcomingBookings: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user, bookings } = state;

  // Local state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !bookings) {
      // If coming direct, retrieve from DB
      getBookings({ user: user.email })
        .then((data) =>
          // Store in global state
          dispatch({
            type: 'SET_BOOKINGS',
            payload: data,
          })
        )
        .catch((err) =>
          dispatch({
            type: 'SET_ERROR',
            payload: formatError(err),
          })
        );
    }
  }, [dispatch, user, bookings]);

  useEffect(() => {
    // Find booking
    if (bookings) {
      setLoading(false);
    }
  }, [bookings]);

  const upcomingBookings = bookings?.filter(
    (b) => isFuture(parse(b.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS)) === true
  );

  const previousBookings = bookings?.filter(
    (b) =>
      isBefore(parse(b.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS), startOfDay(new Date())) ===
      true
  );

  // Render
  return (
    <Layout>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <UpcomingBookingsStyles>
          <h2>Upcoming Bookings</h2>
          {upcomingBookings && upcomingBookings.length > 0 && (
            <Paper square className="bookings">
              {upcomingBookings.map((row, index) => (
                <div key={row.id} className="grid">
                  <div key={index} className="row">
                    <div className="left">
                      <p className="date">
                        {format(
                          parse(row.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS),
                          'do LLL',
                          DATE_FNS_OPTIONS
                        )}
                      </p>
                      <p className="office">{row.office}</p>
                    </div>
                    <div className="right">
                      <OurButton
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          navigate(`./booking/${row?.id}`);
                        }}
                      >
                        View Pass
                      </OurButton>
                    </div>
                  </div>
                </div>
              ))}
            </Paper>
          )}
          {previousBookings && previousBookings.length > 0 && (
            <ul className="previous-bookings">
              <h3>Previous Bookings</h3>
              {previousBookings.map((row, index) => (
                <li key={row.id} className="previous-bookings-list">
                  <p className="previous-booking-item">
                    {format(
                      parse(row.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS),
                      'do LLL',
                      DATE_FNS_OPTIONS
                    )}
                    <span className="previous-booking-office">at {row.office}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="button">
            <OurButton
              type="button"
              variant="contained"
              color="primary"
              onClick={() => {
                navigate(`/`);
              }}
            >
              Home
            </OurButton>
          </div>
        </UpcomingBookingsStyles>
      )}
    </Layout>
  );
};

export default UpcomingBookings;
