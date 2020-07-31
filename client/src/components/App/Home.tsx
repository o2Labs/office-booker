import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from '@reach/router';

import { AppContext } from '../AppProvider';

import Layout from '../Layout/Layout';
import Loading from '../Assets/LoadingSpinner';
import WhichOffice from './Home/WhichOffice';
import NextBooking from './Home/NextBooking';
import MakeBooking from './Home/MakeBooking';

import { getOffices } from '../../lib/api';
import { formatError } from '../../lib/app';

import HomeStyles from './Home.styles';

// Component
const Home: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { office } = state;

  // Local state
  const [loading, setLoading] = useState(true);

  // Effects
  useEffect(() => {
    // Restore selected office from local storage
    const localOffice = localStorage.getItem('office');

    if (!office && localOffice) {
      getOffices()
        .then((data) => {
          // Validate local storage and set global state
          const findOffice = data.find((o) => o.name === localOffice);

          dispatch({
            type: 'SET_OFFICE',
            payload: findOffice && findOffice.name,
          });
        })
        .catch((err) =>
          dispatch({
            type: 'SET_ALERT',
            payload: {
              message: formatError(err),
              color: 'error',
            },
          })
        );
    } else {
      setLoading(false);
    }
  }, [dispatch, office]);

  // Render
  return (
    <Layout>
      <HomeStyles>
        {loading ? (
          <Loading />
        ) : office ? (
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
