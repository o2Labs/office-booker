import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import Paper from '@material-ui/core/Paper';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfDay from 'date-fns/startOfDay';
import { AppContext } from '../AppProvider';

import LoadingSpinner from '../Assets/LoadingSpinner';
import { OurButton } from '../../styles/MaterialComponents';
import Layout from '../Layout/Layout';

import { getBookings } from '../../lib/api';
import { formatError } from '../../lib/app';
import { DATE_FNS_OPTIONS } from '../../constants/dates';
import EmojiTransportationIcon from '@material-ui/icons/EmojiTransportation';

import UpcomingBookingsStyles from './UpcomingBookings.styles';
import BusinessIcon from '@material-ui/icons/Business';

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

  const today = format(startOfDay(new Date()), 'yyyy-MM-dd');

  const upcomingBookings = bookings?.filter((b) => b.date >= today);
  const previousBookings = bookings?.filter((b) => b.date < today);

  // Handlers
  const determinePreviousBookingParking = (parking: boolean): string => {
    return parking ? 'with Parking' : 'without Parking';
  };

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
                        endIcon={row.parking ? <EmojiTransportationIcon /> : <BusinessIcon />}
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
                    {` `}
                    <span>{determinePreviousBookingParking(row.parking)}</span>
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
