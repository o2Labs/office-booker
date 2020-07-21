import React, { useState, useEffect } from 'react';
import DriveEtaIcon from '@material-ui/icons/DriveEta';
import PersonIcon from '@material-ui/icons/Person';

import BookingStatusStyles from './BookingStatus.styles';

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

  function getBarNums(quota: number, available: number) {
    const unit = quota / splitBy;
    const num = available && Math.round(available / unit);
    return num ? num : 1;
  }

  return (
    <BookingStatusStyles
      //   office={getStatus(officeQuota, officeAvailable)}
      //   parking={getStatus(parkingQuota, parkingAvailable)}
      office={getStatus(100, 70)}
      parking={getStatus(100, 10)}
    >
      <section>
        <PersonIcon />
        <div className="bars office">
          {[
            ...Array(
              //   getBarNums(officeQuota, officeAvailable)
              getBarNums(100, 70)
            ),
          ].map((e, i) => (
            <div className="bar" key={i}></div>
          ))}
        </div>
      </section>
      <section>
        <DriveEtaIcon />
        <div className="bars parking">
          {[
            ...Array(
              //   getBarNums(parkingQuota, parkingAvailable)
              getBarNums(100, 10)
            ),
          ].map((e, i) => (
            <div className="bar" key={i}></div>
          ))}
        </div>
      </section>
    </BookingStatusStyles>
  );
};

export default BookingStatus;
