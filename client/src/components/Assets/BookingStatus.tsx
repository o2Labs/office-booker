import React from 'react';
import DriveEtaIcon from '@material-ui/icons/DriveEta';
import PersonIcon from '@material-ui/icons/Person';

import BookingStatusStyles from './BookingStatus.styles';
import { Tooltip } from '@material-ui/core';

export type Status = 'h' | 'm' | 'l';

type Props = {
  officeQuota: number;
  officeAvailable: number;
  parkingQuota: number;
  parkingAvailable: number;
};

const BookingStatus: React.FC<Props> = (props) => {
  const { officeQuota, officeAvailable, parkingQuota, parkingAvailable } = props;
  const splitBy = 4;

  function getStatus(quota: number, available: number) {
    const unit = quota / splitBy;

    if (available < unit) {
      return 'l';
    } else if (available < unit * (splitBy - 1)) {
      return 'm';
    } else {
      return 'h';
    }
  }

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
      <Tooltip title={`Office Space: ${parkingAvailable} left`} arrow>
        <section>
          <DriveEtaIcon />
          <div className="bars">
            <div className="bar parking"></div>
          </div>
        </section>
      </Tooltip>
    </BookingStatusStyles>
  );
};

export default BookingStatus;
