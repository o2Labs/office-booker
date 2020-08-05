import React, { useContext, useEffect, useState, useCallback } from 'react';
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

  // Helpers
  const getAllOffices = useCallback(() => {
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

  const getAllBookings = useCallback(() => {
    if (user) {
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
  }, [user, dispatch]);

  // Effects
  useEffect(() => {
    // Get all offices
    getAllOffices();
  }, [getAllOffices]);

  useEffect(() => {
    if (allOffices) {
      // Retrieve selected office
      if (office) {
        // Validate
        const findOffice = allOffices.find((o) => o.name === office);

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
      getAllBookings();
    }
  }, [currentOffice, user, getAllBookings]);

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
  const handleRefreshBookings = () => {
    // Re-retrieve offices (and subsequently bookings) from the DB
    getAllOffices();
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
                refreshBookings={handleRefreshBookings}
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
