import React, { useContext } from 'react';

import { AppContext } from '../../AppProvider';
import { OfficeWithSlots } from '../../../types/api';

import { OurButton } from '../../../styles/MaterialComponents';
import WhichOfficeStyles from './WhichOffice.styles';

// Types
type Props = {
  offices: OfficeWithSlots[];
};

// Component
const WhichOffice: React.FC<Props> = (props) => {
  // Global state
  const { dispatch } = useContext(AppContext);

  // Handlers
  const selectOffice = (office: OfficeWithSlots) => {
    // Update global state
    dispatch({
      type: 'SET_OFFICE',
      payload: office,
    });
  };

  // Render
  return (
    <WhichOfficeStyles>
      <h2>Select your office</h2>

      <div className="buttons">
        {props.offices.map((o) => (
          <OurButton
            key={o.name}
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => selectOffice(o)}
          >
            {o.name}
          </OurButton>
        ))}
      </div>
    </WhichOfficeStyles>
  );
};

export default WhichOffice;
