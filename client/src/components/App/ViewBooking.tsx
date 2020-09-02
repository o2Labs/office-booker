import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import Paper from '@material-ui/core/Paper';
import format from 'date-fns/format';
import parse from 'date-fns/parse';

import { AppContext } from '../AppProvider';

import LoadingSpinner from '../Assets/LoadingSpinner';
import { OurButton } from '../../styles/MaterialComponents';
import Layout from '../Layout/Layout';

import { getBookings } from '../../lib/api';
import { formatError } from '../../lib/app';
import { Booking } from '../../types/api';
import { DATE_FNS_OPTIONS } from '../../constants/dates';

import ViewBookingStyles from './ViewBooking.styles';

type Props = {
  id: Booking['id'];
};

const ViewBooking: React.FC<RouteComponentProps<Props>> = (props) => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user } = state;

  // Local state
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | undefined>(undefined);

  // Effects
  useEffect(() => {
    if (user) {
      getBookings({ user: user.email })
        .then((data) => {
          const findBooking = data.find((b) => b.id === props.id);

          if (findBooking) {
            setBooking(findBooking);
          } else {
            setLoading(false);

            // Bounce back to home
            setTimeout(() => navigate('/'), 2500);
          }
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
  }, [dispatch, user, props.id]);

  useEffect(() => {
    // Finished loading
    if (booking) {
      setLoading(false);
    }
  }, [booking]);

  // Render
  if (!user) {
    return null;
  }

  const emailSplit = user.email.split('@');

  return (
    <Layout>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <ViewBookingStyles>
          {booking ? (
            <Paper square className="card">
              <p className="day">
                {format(
                  parse(booking.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS),
                  'eeee',
                  DATE_FNS_OPTIONS
                )}
              </p>
              <h2>
                {format(
                  parse(booking.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS),
                  'do LLLL',
                  DATE_FNS_OPTIONS
                )}
              </h2>

              <h3>{booking.office.name}</h3>
              {booking.parking && <p className="parking">+ parking</p>}

              <div className="breaker"></div>

              <h4>{emailSplit[0]}</h4>
              <p className="domain">@{emailSplit[1]}</p>
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
