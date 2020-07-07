import React, { useContext } from 'react';

import { AppContext } from '../../AppProvider';
import { Office } from '../../../types/api';

import { OurButton } from '../../../styles/MaterialComponents';
import WhichOfficeStyles from './WhichOffice.styles';

const WhichOffice: React.FC = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);

  // Handlers
  const selectOffice = (office: Office) => {
    // Update local storage
    if (office) {
      localStorage.setItem('office', office.name);
    } else {
      localStorage.removeItem('office');
    }

    // Store in global state
    dispatch({
      type: 'SET_CURRENT_OFFICE',
      payload: office,
    });
  };

  // Render
  return (
    <WhichOfficeStyles>
      <h2>Select your office</h2>

      <div className="buttons">
        {state.offices.map((o) => (
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
