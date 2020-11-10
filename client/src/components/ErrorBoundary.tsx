import React from 'react';
import StructureStyles from './Structure.styles';
import Layout from './Layout/Layout';
import { OurButton } from '../styles/MaterialComponents';
import ErrorPageStyles from './Assets/ErrorPage.styles';

export default class ErrorBoundary extends React.Component<unknown, { hasError: boolean }> {
  constructor(props: Readonly<unknown>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <StructureStyles>
          <Layout>
            <ErrorPageStyles>
              <h2>Something went wrong.</h2>
              <p>
                Something has gone wrong with the application. Please reload your browser window to
                continue.
              </p>
              <OurButton
                variant="contained"
                color="primary"
                onClick={() => window.location.reload()}
              >
                Reload application
              </OurButton>
            </ErrorPageStyles>
          </Layout>
        </StructureStyles>
      );
    }

    return this.props.children;
  }
}
