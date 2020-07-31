import React, { useContext, useState, useEffect } from 'react';
import { Router } from '@reach/router';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

import { AppContext } from './AppProvider';
import { AppState } from '../context/stores';

import RequireLogin from './Auth/RequireLogin';
import Layout from './Layout/Layout';
import TestBanner from './TestBanner';
import PageNotFound from './App/PageNotFound';
import Home from './App/Home';
import ViewBooking from './App/ViewBooking';
import Help from './App/Help';
import Bookings from './App/Admin/Bookings';
import Users from './App/Admin/Users';
import User from './App/Admin/User';
import CreateBooking from './App/Admin/CreateBooking';
import UpcomingBookings from './App/UpcomingBookings';
import Privacy from './App/Privacy';
import LoadingSpinner from './Assets/LoadingSpinner';

import { configureAuth } from '../lib/auth';

import StructureStyles from './Structure.styles';

const Structure: React.FC = () => {
  const TRANSITION_DURATION = 300;

  // Global state
  const { state, dispatch } = useContext(AppContext);

  // Local state
  const [currentAlert, setCurrentAlert] = useState<AppState['alert']>(undefined);

  useEffect(() => {
    if (!state.config) {
      fetch('/api/config')
        .then((res) => res.json())
        .then((config) => {
          configureAuth(config);

          // Update global state
          dispatch({ type: 'SET_CONFIG', payload: config });
        })
        .catch((err) =>
          dispatch({
            type: 'SET_ALERT',
            payload: {
              message: err,
              color: 'error',
            },
          })
        );
    }
  }, [state.config, dispatch]);

  // Effects
  useEffect(() => {
    // Set local error
    if (state.alert) {
      setCurrentAlert(state.alert);
    }
  }, [state.alert]);

  useEffect(() => {
    // Clear Global error
    if (!currentAlert) {
      // Wait for transition to finish before clearing
      setCurrentAlert(undefined);
    }
  }, [currentAlert]);

  // Handlers
  const handleCloseError = () =>
    dispatch({
      type: 'SET_ALERT',
      payload: undefined,
    });

  // Render
  return (
    <StructureStyles>
      {state.config === undefined ? (
        <Layout>
          <LoadingSpinner />
        </Layout>
      ) : (
        <>
          {state.config.showTestBanner && <TestBanner />}

          <Router>
            <RequireLogin path="/">
              <Home path="/" />
              <ViewBooking path="/booking/:id" />
              <UpcomingBookings path="/bookings" />

              <Bookings path="/admin" />
              <CreateBooking path="/admin/booking" />
              <Users path="/admin/users" />
              <User path="/admin/users/:email" />

              <Privacy path="/privacy" />
              <PageNotFound default={true} />
            </RequireLogin>

            <Help path="/help" />
          </Router>

          <Snackbar
            open={!!currentAlert}
            onClose={handleCloseError}
            transitionDuration={TRANSITION_DURATION}
          >
            <Alert
              variant="filled"
              severity={currentAlert?.color || 'info'}
              onClose={handleCloseError}
            >
              {currentAlert?.message || ''}
            </Alert>
          </Snackbar>
        </>
      )}
    </StructureStyles>
  );
};

export default Structure;
