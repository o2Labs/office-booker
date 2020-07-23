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
import Admin from './App/Admin/Admin';
import Users from './App/Admin/Users';
import User from './App/Admin/User';
import AdminCreateBooking from './App/Admin/AdminCreateBooking';
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
  const [currentError, setCurrentError] = useState<AppState['error']>(undefined);

  useEffect(() => {
    if (state.config === undefined) {
      fetch('/api/config')
        .then((res) => res.json())
        .then((config) => {
          configureAuth(config);

          dispatch({ type: 'SET_CONFIG', payload: config });
        })
        .catch((err) =>
          dispatch({
            type: 'SET_ERROR',
            payload: err,
          })
        );
    }
  }, [state.config, dispatch]);

  // Effects
  useEffect(() => {
    // Set local error
    if (state.error) {
      setCurrentError(state.error);
    }
  }, [state.error]);

  useEffect(() => {
    // Clear Global error
    if (!currentError) {
      // Wait for transition to finish before clearing
      setCurrentError(undefined);
    }
  }, [dispatch, currentError]);

  // Handlers
  const handleCloseError = () =>
    dispatch({
      type: 'SET_ERROR',
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

              <Admin path="/admin" />
              <Users path="/admin/users" />
              <User path="/admin/users/:email" />
              <AdminCreateBooking path="/admin/createBooking" />

              <Privacy path="/privacy" />
              <PageNotFound default={true} />
            </RequireLogin>

            <Help path="/help" />
          </Router>

          {currentError !== undefined ? (
            <Snackbar
              open={state.error !== undefined}
              onClose={handleCloseError}
              transitionDuration={TRANSITION_DURATION}
            >
              <Alert variant="filled" severity={currentError.color} onClose={handleCloseError}>
                {currentError.message}
              </Alert>
            </Snackbar>
          ) : null}
        </>
      )}
    </StructureStyles>
  );
};

export default Structure;
