import { CognitoUser } from '@aws-amplify/auth';
import React, { useState, useContext, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';

import { AppContext } from '../AppProvider';

import LoadingButton from '../Assets/LoadingButton';

import { verifyCode, getAuthState } from '../../lib/auth';
import { formatError } from '../../lib/app';
import { getUserCached } from '../../lib/api';

import EnterCodeStyles from './EnterCode.styles';

type Props = {
  user: CognitoUser;
  onCodeExpired: () => void;
};

const EnterCode: React.FC<Props> = (props) => {
  // Global state
  const { state, dispatch } = useContext(AppContext);

  // Local state
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Handlers
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    // Validate code and retrieve username
    try {
      const validCode = await verifyCode(props.user, code);

      if (!validCode) {
        setLoading(false);

        return dispatch({
          type: 'SET_ALERT',
          payload: {
            message: 'Invalid verification code, please try again',
            color: 'error',
          },
        });
      }

      const username = await getAuthState();

      if (!username) {
        setLoading(false);

        return dispatch({
          type: 'SET_ALERT',
          payload: {
            message: 'User not found',
            color: 'error',
          },
        });
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
              message: err,
              color: 'error',
            },
          })
        );
    } catch (err) {
      setLoading(false);

      // HACK: Bad code has error type of string.
      // When can no longer try again, it comes through as an object
      if (typeof err === 'string') {
        return dispatch({
          type: 'SET_ALERT',
          payload: {
            message: err,
            color: 'error',
          },
        });
      }

      if (err.code === 'NotAuthorizedException') {
        // Wrong code entered 3 times or expired
        dispatch({
          type: 'SET_ALERT',
          payload: {
            message:
              'Sending a new code. Previous code has expired or was entered incorrectly too many times.',
            color: 'error',
          },
        });

        return props.onCodeExpired();
      }

      dispatch({
        type: 'SET_ALERT',
        payload: {
          message: formatError(err),
          color: 'error',
        },
      });
    }
  };

  // Effects
  useEffect(() => {
    // Finished loading once we have retrieve the user
    if (state.user) {
      setLoading(false);
    }
  }, [state.user]);

  // Render
  return (
    <EnterCodeStyles>
      <h2>Verify</h2>

      <form onSubmit={handleSubmit} className="form">
        <p>Please enter your verification code to continue.</p>

        <TextField
          label="Code"
          type="number"
          fullWidth
          placeholder="e.g. 733737"
          required
          onChange={(e) => setCode(e.target.value)}
        />

        <p className="sub">
          The code has been sent to <span>{props.user.getUsername()}</span>
        </p>

        <p className="sub">This code is valid for 3 minutes.</p>

        <LoadingButton type="submit" variant="contained" color="primary" isLoading={loading}>
          Submit
        </LoadingButton>
      </form>
    </EnterCodeStyles>
  );
};

export default EnterCode;
