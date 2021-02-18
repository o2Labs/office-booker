import React, { useContext, useState, useEffect } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

import { AppContext } from './AppProvider';

import Layout from './Layout/Layout';
import TestBanner from './TestBanner';
import LoadingSpinner from './Assets/LoadingSpinner';

import { configureAuth } from '../lib/auth';

import StructureStyles from './Structure.styles';

const Structure: React.FC = (props) => {
  const TRANSITION_DURATION = 300;

  // Global state
  const { state, dispatch } = useContext(AppContext);

  // Local state
  const [showAlert, setShowAlert] = useState(false);

  // Effects
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

  useEffect(() => {
    if (state.alert) {
      setShowAlert(true);
    }
  }, [state.alert]);

  // Handlers
  const handleCloseAlert = () => {
    setShowAlert(false);

    // Clear global state after animation
    setTimeout(
      () =>
        dispatch({
          type: 'SET_ALERT',
          payload: undefined,
        }),
      TRANSITION_DURATION
    );
  };

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

          {props.children}
          <Snackbar
            open={showAlert}
            onClose={() => handleCloseAlert()}
            transitionDuration={TRANSITION_DURATION}
          >
            <Alert
              variant="filled"
              severity={state.alert?.color || 'info'}
              onClose={() => handleCloseAlert()}
            >
              {state.alert?.message || ''}
            </Alert>
          </Snackbar>
        </>
      )}
    </StructureStyles>
  );
};

export default Structure;
