import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import Link from '@material-ui/core/Link';

import { AppContext } from '../AppProvider';

import Layout from '../Layout/Layout';

import { getAuthState } from '../../lib/auth';
import { getUserCached, getOffices, getOffice } from '../../lib/api';
import { formatError } from '../../lib/app';

import HelpStyles from './Help.styles';
import { OfficeWithSlots } from '../../types/api';

const Help: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user, office } = state;

  const [currentOffice, setCurrentOffice] = useState<OfficeWithSlots | undefined>();

  useEffect(() => {
    if (office && 'id' in office) {
      getOffice(office.id)
        .then(setCurrentOffice)
        .catch((err) =>
          dispatch({
            type: 'SET_ALERT',
            payload: {
              message: formatError(err),
              color: 'error',
            },
          })
        );
    }
    if (office && 'name' in office) {
      getOffices()
        .then((offices) =>
          dispatch({
            type: 'SET_OFFICE',
            payload: offices.find((o) => o.name === office.name),
          })
        )
        .catch((err) =>
          dispatch({
            type: 'SET_ALERT',
            payload: {
              message: formatError(err),
              color: 'error',
            },
          })
        );
    }
  }, [office, dispatch]);

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
                  type: 'SET_ALERT',
                  payload: {
                    message: formatError(err),
                    color: 'error',
                  },
                })
              );
          }
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
    }
  }, [dispatch, user]);

  useEffect(() => {
    // Validate global office
    if (user && office) {
      getOffices()
        .then((data) => {
          // Validate and update local storage if not
          const findOffice =
            'id' in office
              ? data.find((o) => o.id === office.id)
              : data.find((o) => o.name === office.name);

          if (!findOffice) {
            dispatch({
              type: 'SET_OFFICE',
              payload: undefined,
            });
          }
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
    }
  }, [dispatch, user, office]);

  // Handlers
  const handleClearOffice = () => {
    // Update global state
    dispatch({
      type: 'SET_OFFICE',
      payload: undefined,
    });

    // Change page if required
    navigate('/');
  };

  // Render
  if (!state.config) {
    return null;
  }

  return (
    <Layout>
      <HelpStyles>
        <h2>Help</h2>
        <p>
          The purpose of the Office Booker app is to help coordinate the safe use of office
          facilities by proactively managing demand.
        </p>

        <h3>General Information</h3>

        <p>Bookings can only be made {state.config.advancedBookingDays} days in advance.</p>

        {user && currentOffice && (
          <div className="change-office">
            <p>
              You are currently booking for <span>{currentOffice.name}</span>.
            </p>
            <Link
              component="button"
              underline="always"
              color="primary"
              onClick={() => handleClearOffice()}
            >
              Change office
            </Link>
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
