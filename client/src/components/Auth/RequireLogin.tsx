import { CognitoUser } from '@aws-amplify/auth';
import { RouteComponentProps } from '@reach/router';
import React, { useContext, useEffect, useState } from 'react';

import { AppContext } from '../AppProvider';

import Layout from '../Layout/Layout';
import EnterEmail from './EnterEmail';
import EnterCode from './EnterCode';

import { getAuthState, signIn } from '../../lib/auth';
import { getUserCached } from '../../lib/api';
import { formatError } from '../../lib/app';
import LoadingSpinner from '../Assets/LoadingSpinner';

type View = { name: 'email' } | { name: 'code'; user: CognitoUser };

const RequireLogin: React.FC<RouteComponentProps> = (props) => {
  // Global state
  const { state, dispatch } = useContext(AppContext);

  // Local state
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>({ name: 'email' });

  // Effects
  useEffect(() => {
    // Restore session
    if (!state.user) {
      // Retrieve cognito session
      getAuthState()
        .then((username) => {
          // Not found
          if (!username) {
            setView({ name: 'email' });
            setLoading(false);

            return;
          }

          // Retrieve DB user
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
      // Default view
      setView({ name: 'email' });
    }
  }, [state.user, dispatch]);

  // Effects
  useEffect(() => {
    // Finished loading once we have retrieve the user
    if (state.user) {
      setLoading(false);
    }
  }, [state.user]);

  // Loading
  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  // Logged in
  if (state.user) {
    return <>{props.children}</>;
  }

  // Login/Validation code
  return (
    <Layout>
      {view.name === 'email' ? (
        <EnterEmail onComplete={(user) => setView({ name: 'code', user })} />
      ) : view.name === 'code' ? (
        <EnterCode
          user={view.user}
          onCodeExpired={() => {
            setLoading(true);
            signIn(view.user.getUsername()).then((user) => {
              setLoading(false);
              setView({ name: 'code', user });
            });
          }}
        />
      ) : null}
    </Layout>
  );
};

export default RequireLogin;
