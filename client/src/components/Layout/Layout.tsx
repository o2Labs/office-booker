import React from 'react';

import Footer from './Footer';
import Header from './Header';

import LayoutStyles from './Layout.styles';

const Layout: React.FC = (props) => (
  <LayoutStyles>
    <Header />
    <main>{props.children}</main>
    <Footer />
  </LayoutStyles>
);

export default Layout;
