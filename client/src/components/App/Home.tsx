import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from '@reach/router';

import { AppContext } from '../AppProvider';

import Layout from '../Layout/Layout';
import Loading from '../Assets/LoadingSpinner';
import WhichOffice from './Home/WhichOffice';
import NextBooking from './Home/NextBooking';
import MakeBooking from './Home/MakeBooking';

import { getOffices, getBookings, getOffice } from '../../lib/api';
import { formatError } from '../../lib/app';
import { OfficeWithSlots, Booking, Office } from '../../types/api';

import HomeStyles from './Home.styles';

// Component
const Home: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user, office } = state;

  // Local state
  const [loading, setLoading] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState(new Date());
  const [allOffices, setAllOffices] = useState<Office[] | undefined>();
  const [currentOffice, setCurrentOffice] = useState<OfficeWithSlots | undefined>();
  const [userBookings, setUserBookings] = useState<Booking[] | undefined>();

  // Effects
  useEffect(() => {
    getOffices()
      .then(setAllOffices)
      .catch((err) => {
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
    // Get all offices
    if (office === undefined) {
      return;
    }
    if ('id' in office) {
      setLoading(true);
      getOffice(office.id)
        .then(setCurrentOffice)
        .catch((err) => {
          dispatch({
            type: 'SET_ALERT',
            payload: {
              message: formatError(err),
              color: 'error',
            },
          });
        })
        .then(() => setLoading(false));
    }
    if ('name' in office && allOffices) {
      const newOffice = allOffices.find((o) => o.name === office.name);
      dispatch({
        type: 'SET_OFFICE',
        payload: newOffice !== undefined ? { id: newOffice.id } : undefined,
      });
    }
  }, [office, allOffices, refreshedAt, dispatch]);

  useEffect(() => {
    if (user && refreshedAt) {
      // Get users bookings
      getBookings({ user: user.email })
        .then((data) => setUserBookings(data))
        .catch((err) => {
          dispatch({
            type: 'SET_ALERT',
            payload: {
              message: formatError(err),
              color: 'error',
            },
          });
        });
    }
  }, [user, refreshedAt, dispatch]);

  useEffect(() => {
    if (!office) {
      // Clear everything when the global office is cleared
      setCurrentOffice(undefined);
    }
  }, [office]);

  // Handlers
  const handleRefreshBookings = () => {
    // Re-retrieve offices (and subsequently bookings) from the DB
    setRefreshedAt(new Date());
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
