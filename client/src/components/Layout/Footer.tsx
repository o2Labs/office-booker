import React, { useContext, useEffect } from 'react';
import { navigate, Link as ReachLink } from '@reach/router';
import Link from '@material-ui/core/Link';

import { AppContext } from '../AppProvider';

import { signOut, getAuthState } from '../../lib/auth';
import { formatError } from '../../lib/app';

import FooterStyles from './Footer.styles';
import { getUserCached } from '../../lib/api';

const Footer: React.FC = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user } = state;

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

  // Handlers
  const handleSignOut = () => {
    // Sign out
    signOut()
      .then(() => {
        dispatch({ type: 'SET_USER', payload: undefined });

        navigate('/');
      })
      .catch((err) =>
        dispatch({
          type: 'SET_ERROR',
          payload: formatError(err),
        })
      );
  };

  // Render
  return (
    <FooterStyles>
      <div className="link">
        <ReachLink to="/help">Help</ReachLink>
      </div>

      <div className="link">
        <ReachLink to="/privacy">Privacy</ReachLink>
      </div>
      {user?.permissions.canViewAdminPanel && (
        <div className="link">
          <ReachLink to="/admin">Admin</ReachLink>
        </div>
      )}
      {user && (
        <div className="link">
          <Link component="button" color="inherit" onClick={() => handleSignOut()}>
            Sign Out
          </Link>
        </div>
      )}
    </FooterStyles>
  );
};

export default Footer;
