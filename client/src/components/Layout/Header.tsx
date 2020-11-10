import React from 'react';
import { navigate } from '@reach/router';
import Link from '@material-ui/core/Link';

import HeaderStyles from './Header.styles';

import OfficesIcon from '../../assets/images/multiple-offices-icon.svg';
import LabIcon from '../../assets/images/the-lab-logo-white.svg';

const Header: React.FC = () => (
  <HeaderStyles>
    <div className="app-icon">
      <Link component="button" onClick={() => navigate('/')}>
        <img src={OfficesIcon} alt="" />
      </Link>
    </div>

    <div className="title">
      <h1>
        <Link href="/">Office Booker</Link>
      </h1>
    </div>

    <div className="lab-logo">
      <Link href="https://github.com/o2Labs/" rel="noopener noreferrer" target="_blank">
        <img src={LabIcon} alt="" />
      </Link>
    </div>
  </HeaderStyles>
);

export default Header;
