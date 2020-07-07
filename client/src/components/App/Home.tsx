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

import HomeStyles from './Home.styles';

// Component
const Home: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { offices, currentOffice, user, bookings } = state;

  // Local state
  const [loading, setLoading] = useState(true);

  // Effects
  useEffect(() => {
    // Get all offices
    getOffices()
      .then((data) =>
        // Store in global state
        dispatch({
          type: 'SET_OFFICES',
          payload: data,
        })
      )
      .catch((err) =>
        dispatch({
          type: 'SET_ERROR',
          payload: formatError(err),
        })
      );
  }, [dispatch]);

  useEffect(() => {
    if (offices.length > 0) {
      // Restore selected office from local storage
      const localOffice = localStorage.getItem('office');

      if (!localOffice) {
        return setLoading(false);
      }

      // Validate local storage value
      const office = offices.find((o) => o.name === localOffice);

      if (!office) {
        return setLoading(false);
      }

      // Store in global state
      dispatch({
        type: 'SET_CURRENT_OFFICE',
        payload: office,
      });
    }
  }, [dispatch, offices]);

  useEffect(() => {
    // Only retrieve bookings if a current office is found
    if (currentOffice && user) {
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
  }, [dispatch, currentOffice, user]);

  useEffect(() => {
    // Clear loading once global state is updated
    if (currentOffice && bookings) {
      setLoading(false);
    }
  }, [currentOffice, bookings]);

  // Render
  return (
    <Layout>
      <HomeStyles>
        {loading ? (
          <Loading />
        ) : currentOffice ? (
          <>
            <NextBooking />
            <MakeBooking />
          </>
        ) : (
          <WhichOffice />
        )}
      </HomeStyles>
    </Layout>
  );
};

export default Home;
