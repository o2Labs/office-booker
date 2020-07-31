import React, { useState, useEffect } from 'react';
import { RouteComponentProps, navigate, Redirect } from '@reach/router';

import Layout from '../Layout/Layout';
import { OurButton } from '../../styles/MaterialComponents';

import PageNotFoundStyles from './PageNotFound.styles';

const PageNotFound: React.FC<RouteComponentProps> = () => {
  // Local state
  const [activateRedirect, setActivateRedirect] = useState(false);

  // Effects
  useEffect(() => {
    setTimeout(() => {
      setActivateRedirect(true);
    }, 5000);
  }, []);

  // Render
  return (
    <Layout>
      <PageNotFoundStyles>
        <h2>Page Not Found</h2>
        <p>We&apos;ll redirect you to home in 5 seconds</p>

        {activateRedirect && <Redirect to="/" noThrow />}

        <OurButton
          type="submit"
          variant="contained"
          color="primary"
          onClick={() => {
            navigate(`/`);
          }}
        >
          Redirect Now
        </OurButton>
      </PageNotFoundStyles>
    </Layout>
  );
};

export default PageNotFound;
