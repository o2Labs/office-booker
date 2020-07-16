import React, { useState, useContext } from 'react';
import { CognitoUser } from '@aws-amplify/auth';
import TextField from '@material-ui/core/TextField';

import { AppContext } from '../AppProvider';

import LoadingButton from '../Assets/LoadingButton';

import { signIn } from '../../lib/auth';
import { formatError } from '../../lib/app';

import EnterEmailStyles from './EnterEmail.styles';
import { validateEmail } from '../../lib/emailValidation';

type Props = { onComplete: (user: CognitoUser) => void };

const EnterEmail: React.FC<Props> = (props) => {
  // Global state
  const { state, dispatch } = useContext(AppContext);

  // Local state
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Helpers
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) {
      return;
    }

    // Validate
    const isValid = validateEmail(state.config?.emailRegex, email);

    if (isValid) {
      setLoading(true);

      // Check sign-in
      signIn(email)
        .then((user) => {
          // Continue to parent
          props.onComplete(user);
        })
        .catch((err) => {
          dispatch({
            type: 'SET_ERROR',
            payload: formatError(err),
          });

          setLoading(false);
        });
    } else {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Email address not permitted',
      });

      setLoading(false);
    }
  };

  // Render
  return (
    <EnterEmailStyles>
      <h2>Login</h2>

      <form onSubmit={handleSubmit} className="form">
        <p>You must verify your email address before accessing the app.</p>

        <TextField
          label="Email Address"
          type="email"
          color="primary"
          fullWidth
          onChange={(e) => setEmail(e.target.value)}
        />

        <ul className="sub">
          <li>We&apos;ll send you a unique code to sign you in.</li>
          <li>This code is valid for 3 minutes.</li>
          <li>You must be authorised to use this system.</li>
        </ul>

        <LoadingButton type="submit" variant="contained" color="primary" isLoading={loading}>
          Submit
        </LoadingButton>
      </form>
    </EnterEmailStyles>
  );
};

export default EnterEmail;
