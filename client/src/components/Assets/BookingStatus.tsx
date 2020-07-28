import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import DriveEtaIcon from '@material-ui/icons/DriveEta';
import PersonIcon from '@material-ui/icons/Person';

import BookingStatusStyles from './BookingStatus.styles';

// Constants
const SPLIT_BY = 4;

// Types
export type Status = 'h' | 'm' | 'l';

type Props = {
  officeQuota: number;
  officeAvailable: number;
  parkingQuota: number;
  parkingAvailable: number;
};

// Component
const BookingStatus: React.FC<Props> = ({
  officeQuota,
  officeAvailable,
  parkingQuota,
  parkingAvailable,
}) => {
  // Helpers
  const getStatus = (quota: number, available: number) => {
    const unit = quota / SPLIT_BY;

    if (available < unit) {
      return 'l';
    }

    if (available < unit * (SPLIT_BY - 1)) {
      return 'm';
    }

    return 'h';
  };

  // Render
  return (
    <BookingStatusStyles
      officeLeft={(officeAvailable / officeQuota) * 100}
      officeStatus={getStatus(officeQuota, officeAvailable)}
      parkingLeft={(parkingAvailable / parkingQuota) * 100}
      parkingStatus={getStatus(parkingQuota, parkingAvailable)}
    >
      <Tooltip title={`Office Space: ${officeAvailable} left`} arrow>
        <section>
          <PersonIcon />

          <div className="bars">
            <div className="bar office"></div>
          </div>
        </section>
      </Tooltip>

      {parkingQuota > 0 && (
        <Tooltip title={`Office Space: ${parkingAvailable} left`} arrow>
          <section>
            <DriveEtaIcon />

            <div className="bars">
              <div className="bar parking"></div>
            </div>
          </section>
        </Tooltip>
      )}
    </BookingStatusStyles>
  );
};

export default BookingStatus;
