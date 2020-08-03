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
  const [allOffices, setAllOffices] = useState<Office[] | undefined>();
  const [currentOffice, setCurrentOffice] = useState<Office | undefined>();
  const [userBookings, setUserBookings] = useState<Booking[] | undefined>();

  // Effects
  useEffect(() => {
    // Get all offices
    getOffices()
      .then((data) => setAllOffices(data))
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
  }, [dispatch]);

  useEffect(() => {
    if (allOffices) {
      // Retrieve selected office
      const selectedOffice = office || localStorage.getItem('office') || undefined;

      if (selectedOffice) {
        // Validate
        const findOffice = allOffices.find((o) => o.name === selectedOffice);

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
      } else {
        setLoading(false);
      }
    }
  }, [allOffices, office, dispatch]);

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
  }, [currentOffice, user, dispatch]);

  useEffect(() => {
    if (userBookings) {
      // Wait until we've finished finding bookings
      setLoading(false);
    }
  }, [userBookings]);

  useEffect(() => {
    if (!office) {
      // Clear everything when the global office is cleared
      setCurrentOffice(undefined);
    }
  }, [office]);

  // Handlers
  const handleAddBooking = (newBooking: Booking) => {
    // Update user bookings
    setUserBookings((bookings) => (bookings ? [...bookings, newBooking] : [newBooking]));

    // Increase office quota
    setCurrentOffice(
      (oldOffice) =>
        oldOffice && {
          ...oldOffice,
          slots: oldOffice.slots.map((slot) => {
            if (slot.date !== newBooking.date) {
              return slot;
            }

            return {
              ...slot,
              booked: slot.booked += 1,
              bookedParking: newBooking.parking ? (slot.bookedParking += 1) : slot.bookedParking,
            };
          }),
        }
    );
  };

  const handleCancelBooking = (bookingId: Booking['id']) => {
    // Find booking
    const cancelledBooking =
      userBookings && userBookings.find((booking) => booking.id === bookingId);

    if (cancelledBooking) {
      // Update user bookings
      setUserBookings((bookings) =>
        bookings ? bookings.filter((booking) => booking.id !== bookingId) : []
      );

      // Decrease office quota
      setCurrentOffice(
        (oldOffice) =>
          oldOffice && {
            ...oldOffice,
            slots: oldOffice.slots.map((slot) => {
              if (slot.date !== cancelledBooking.date) {
                return slot;
              }

              return {
                ...slot,
                booked: slot.booked -= 1,
                bookedParking: cancelledBooking.parking
                  ? (slot.bookedParking -= 1)
                  : slot.bookedParking,
              };
            }),
          }
      );
    } else {
      dispatch({
        type: 'SET_ALERT',
        payload: {
          message: 'Booking not found',
          color: 'error',
        },
      });
    }
  };

  // Render
  return (
    <Layout>
      <HomeStyles>
        {loading || !allOffices ? (
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
          <WhichOffice offices={allOffices} />
        )}
      </HomeStyles>
    </Layout>
  );
};

export default Home;
