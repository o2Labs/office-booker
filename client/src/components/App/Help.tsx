import React, { useContext, useEffect } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import Link from '@material-ui/core/Link';

import { AppContext } from '../AppProvider';

import Layout from '../Layout/Layout';

import { getAuthState } from '../../lib/auth';
import { getUserCached, getOffices } from '../../lib/api';
import { formatError } from '../../lib/app';

import HelpStyles from './Help.styles';

const Help: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user, offices, currentOffice } = state;

  // Effects
  useEffect(() => {
    // Retrieve user if not already available
    if (!user) {
      // Retrieve cognito session
      getAuthState()
        .then((username) => {
          // Retrieve DB user
          if (username) {
            getUserCached(username)
              .then((data) =>
                dispatch({
                  type: 'SET_USER',
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
        })
        .catch((err) =>
          dispatch({
            type: 'SET_ERROR',
            payload: formatError(err),
          })
        );
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      // Restore selected office from local storage
      const localOffice = localStorage.getItem('office');

      // Retrieve offices (to check for a current selected office)
      if (localOffice) {
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
      }
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (offices.length > 0) {
      // Restore selected office from local storage
      const localOffice = localStorage.getItem('office');

      if (!localOffice) {
        return;
      }

      // Validate local storage value
      const office = offices.find((o) => o.name === localOffice);

      if (!office) {
        return;
      }

      // Store in global state
      dispatch({
        type: 'SET_CURRENT_OFFICE',
        payload: office,
      });
    }
  }, [dispatch, offices]);

  // Handlers
  const handleClearOffice = () => {
    // Update local storage
    localStorage.removeItem('office');

    // Update global state
    dispatch({
      type: 'SET_CURRENT_OFFICE',
      payload: undefined,
    });

    // Change page if required
    navigate('/');
  };

  // Render
  return (
    <Layout>
      <HelpStyles>
        <h2>Help</h2>
        <p>
          The purpose of the Office Booker app is to help coordinate the safe use of office
          facilities by proactively managing demand.
        </p>

        <h3>General Information</h3>

        <p>
          Bookings can only be made {process.env.REACT_APP_ADVANCE_BOOKING_DAYS} days in advance.
        </p>

        {user && currentOffice && (
          <div className="change-office">
            <p>
              You are currently booking for <span>{currentOffice.name}</span>.{' '}
              <Link
                component="button"
                underline="always"
                color="primary"
                onClick={() => handleClearOffice()}
              >
                Change office
              </Link>
            </p>
          </div>
        )}

        <h3>Credits</h3>

        <p>
          Office Booker was built by The Lab at O2, visit us on{' '}
          <a href="https://github.com/o2Labs/" rel="noopener noreferrer" target="_blank">
            GitHub
          </a>
          .
        </p>

        <p>Icon made by Freepik from www.flaticon.com</p>
      </HelpStyles>
    </Layout>
  );
};

export default Help;
