import React from 'react';
import StructureStyles from './Structure.styles';
import Layout from './Layout/Layout';
import { OurButton } from '../styles/MaterialComponents';

export default class ErrorBoundary extends React.Component<{}, { hasError: boolean }> {
  constructor(props: Readonly<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <StructureStyles>
          <Layout>
            <div style={{ padding: '0 2rem' }}>
              <h1>Something went wrong.</h1>
              <OurButton variant="contained" onClick={() => window.location.reload()}>
                Reload application
              </OurButton>
            </div>
          </Layout>
        </StructureStyles>
      );
    }

    return this.props.children;
  }
}
