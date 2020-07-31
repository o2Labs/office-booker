import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from '@reach/router';

import { AppContext } from '../AppProvider';

import Layout from '../Layout/Layout';
import Loading from '../Assets/LoadingSpinner';
import WhichOffice from './Home/WhichOffice';
import NextBooking from './Home/NextBooking';
import MakeBooking from './Home/MakeBooking';

import { getOffices, getBookings } from '../../lib/api';
import { formatError } from '../../lib/app';
import { Office, Booking } from '../../types/api';

import HomeStyles from './Home.styles';

// Component
const Home: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user, office } = state;

  // Local state
  const [loading, setLoading] = useState(true);
  const [currentOffice, setCurrentOffice] = useState<Office | undefined>();
  const [userBookings, setUserBookings] = useState<Booking[] | undefined>();

  // Effects
  useEffect(() => {
    // Retrieve current office
    const selectedOffice = office || localStorage.getItem('office') || undefined;

    if (selectedOffice) {
      getOffices()
        .then((data) => {
          // Validate selected office
          const findOffice = data.find((o) => o.name === selectedOffice);

          if (findOffice) {
            setCurrentOffice(findOffice);

            // Update global state if coming from local storage
            if (!office) {
              dispatch({
                type: 'SET_OFFICE',
                payload: findOffice.name,
              });
            }
          } else {
            setLoading(false);
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
    } else {
      setLoading(false);
    }
  }, [dispatch, office]);

  useEffect(() => {
    if (currentOffice && user) {
      // Get users bookings
      getBookings({ user: user.email })
        .then((data) => setUserBookings(data))
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
  }, [currentOffice]);

  useEffect(() => {
    if (userBookings) {
      // Wait until we've finished finding bookings
      setLoading(false);
    }
  }, [userBookings]);

  // Handlers
  const handleAddBooking = (newBooking: Booking) =>
    setUserBookings((bookings) => (bookings ? [...bookings, newBooking] : [newBooking]));

  const handleCancelBooking = (bookingId: Booking['id']) =>
    setUserBookings((bookings) =>
      bookings ? bookings.filter((booking) => booking.id !== bookingId) : []
    );

  // Render
  return (
    <Layout>
      <HomeStyles>
        {loading ? (
          <Loading />
        ) : currentOffice ? (
          userBookings && (
            <>
              <NextBooking bookings={userBookings} />
              <MakeBooking
                office={currentOffice}
                bookings={userBookings}
                addBooking={handleAddBooking}
                cancelBooking={handleCancelBooking}
              />
            </>
          )
        ) : (
          <WhichOffice />
        )}
      </HomeStyles>
    </Layout>
  );
};

export default Home;
