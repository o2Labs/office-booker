import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import Paper from '@material-ui/core/Paper';
import format from 'date-fns/format';
import parse from 'date-fns/parse';

import { AppContext } from '../AppProvider';

import LoadingSpinner from '../Assets/LoadingSpinner';
import Layout from '../Layout/Layout';

import { getBookings } from '../../lib/api';
import { Booking } from '../../types/api';
import { DATE_FNS_OPTIONS } from '../../constants/dates';

import ViewBookingStyles from './ViewBooking.styles';
import { OurButton } from '../../styles/MaterialComponents';
import { formatError } from '../../lib/app';
import { Checkbox } from '@material-ui/core';

type Props = {
  id: Booking['id'];
};

const ViewBooking: React.FC<RouteComponentProps<Props>> = (props) => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user, bookings } = state;

  // Local state
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | undefined>(undefined);
  const [emailSplit, setEmailSplit] = useState<string[] | undefined>();

  // Effects
  useEffect(() => {
    // Split user email
    if (user) {
      setEmailSplit(user.email.split('@'));
    }
  }, [user]);

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
      const booking = bookings.find((b) => b.id === props.id);

      if (booking) {
        setBooking(bookings.find((b) => b.id === props.id));
      } else {
        setLoading(false);

        // Bounce back to home
        setTimeout(() => navigate('/'), 2500);
      }
    }
  }, [props.id, bookings]);

  useEffect(() => {
    // Finished loading
    if (booking) {
      setLoading(false);
    }
  }, [booking]);

  // Render
  return (
    <Layout>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <ViewBookingStyles>
          {booking ? (
            <Paper square className="card">
              <h2>
                {format(
                  parse(booking.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS),
                  'eeee do LLL',
                  DATE_FNS_OPTIONS
                )}
              </h2>
              <h3>{booking.office}</h3>
              {booking.parking && (
                <p className="parking">
                  Parking
                  <Checkbox defaultChecked color="primary" />
                </p>
              )}
              <div className="breaker"></div>
              <h4>{emailSplit && emailSplit[0]}</h4>
              <h5>@{emailSplit && emailSplit[1]}</h5>
            </Paper>
          ) : (
            <p className="not-found">
              Sorry, we can&apos;t find your booking reference. <br />
              Redirecting you to home...
            </p>
          )}

          <div className="button">
            <OurButton
              type="submit"
              variant="contained"
              color="primary"
              onClick={() => {
                navigate(`/`);
              }}
            >
              Home
            </OurButton>
          </div>
        </ViewBookingStyles>
      )}
    </Layout>
  );
};

export default ViewBooking;
