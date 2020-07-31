import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import Paper from '@material-ui/core/Paper';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfDay from 'date-fns/startOfDay';

import { AppContext } from '../AppProvider';

import Layout from '../Layout/Layout';
import LoadingSpinner from '../Assets/LoadingSpinner';
import { OurButton } from '../../styles/MaterialComponents';

import { getBookings } from '../../lib/api';
import { formatError } from '../../lib/app';
import { DATE_FNS_OPTIONS } from '../../constants/dates';
import { Booking } from '../../types/api';

import UpcomingBookingsStyles from './UpcomingBookings.styles';

const UpcomingBookings: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);

  // Local state
  const [loading, setLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[] | undefined>();
  const [previousBookings, setPreviousBookings] = useState<Booking[] | undefined>();

  // Effects
  useEffect(() => {
    const { user } = state;

    if (user) {
      getBookings({ user: user.email })
        .then((data) => {
          // Split for previous and upcoming
          const today = format(startOfDay(new Date()), 'yyyy-MM-dd');

          setUpcomingBookings(data.filter((b) => b.date >= today));
          setPreviousBookings(data.filter((b) => b.date < today));
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
  }, [dispatch]);

  useEffect(() => {
    // Find booking
    if (upcomingBookings && previousBookings) {
      setLoading(false);
    }
  }, [upcomingBookings, previousBookings]);

  // Render
  return (
    <Layout>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <UpcomingBookingsStyles>
          <h2>Upcoming Bookings</h2>

          {upcomingBookings && upcomingBookings.length > 0 ? (
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
          ) : (
            <p>No upcoming bookings found.</p>
          )}

          {previousBookings && previousBookings.length > 0 && (
            <>
              <h3>Previous Bookings</h3>

              <ul>
                {previousBookings.map((row) => (
                  <li key={row.id}>
                    {format(
                      parse(row.date, 'yyyy-MM-dd', new Date(), DATE_FNS_OPTIONS),
                      'do LLLL',
                      DATE_FNS_OPTIONS
                    )}
                    {` `}
                    <span>at {row.office}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {previousBookings && previousBookings.length > 0 && (
            <>
              <h3>Previous Bookings</h3>

              <ul className="previous-bookings">
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
            </>
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
