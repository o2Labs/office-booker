import React, { useState, useEffect } from 'react';
import { RouteComponentProps, navigate, Redirect } from '@reach/router';

import Layout from '../Layout/Layout';
import styled from 'styled-components';
import { OurButton } from '../../styles/MaterialComponents';

const PageNotFoundStyle = styled.div`
  ${(props) => props.theme.breakpoints.up('xs')} {
    padding: 2rem 2rem 2.4rem;
  }

  ${(props) => props.theme.breakpoints.up('sm')} {
    padding: 3rem 3rem 4rem;
  }

  > h2 {
    margin: 0 0 1.4rem;

    color: ${(props) => props.theme.palette.primary.main};
    font-size: 2.4rem;
    font-weight: 400;
  }

  > p {
    color: ${(props) => props.theme.palette.secondary.main};
    font-size: 1.6rem;
    font-weight: 400;
    margin: 0 0 2rem;
  }
`;

const PageNotFound = (props: RouteComponentProps) => {
  const [activateRedirect, setActivateRedirect] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setActivateRedirect(true);
    }, 5000);
  }, []);

  return (
    <Layout>
      <PageNotFoundStyle>
        <h2>Page Not Found</h2>
        <p>We&apos;ll redirect you to home in 5 seconds</p>
        {activateRedirect ? <Redirect to="/" noThrow /> : null}{' '}
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
      </PageNotFoundStyle>
    </Layout>
  );
};

export default PageNotFound;
