import React, { useEffect, useState } from 'react';
import { navigate } from '@reach/router';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import isToday from 'date-fns/isToday';
import Link from '@material-ui/core/Link';

import { DATE_FNS_OPTIONS } from '../../../constants/dates';
import { Booking } from '../../../types/api';

import { OurButton } from '../../../styles/MaterialComponents';
import NextBookingStyles from './NextBooking.styles';

// Types
type Props = {
  bookings: Booking[];
};

// Component
const NextBooking: React.FC<Props> = (props) => {
  // Local state
  const [todaysBooking, setTodaysBooking] = useState<Booking | undefined>();

  // Effects
  useEffect(() => {
    if (props.bookings.length > 0) {
      // Find a booking for today
      setTodaysBooking(
        props.bookings.find((b) => isToday(parse(b.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS)))
      );
    }
  }, [props.bookings]);

  // Render
  if (!todaysBooking) {
    return null;
  }

  return (
    <NextBookingStyles>
      <h2>Today&apos;s Booking</h2>

      <h3>
        {format(
          parse(todaysBooking.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS),
          'do LLL',
          DATE_FNS_OPTIONS
        )}{' '}
        <span>@</span> {todaysBooking.office}
      </h3>

      <OurButton
        type="submit"
        variant="contained"
        color="primary"
        onClick={() => {
          navigate(`./booking/${todaysBooking?.id}`);
        }}
      >
        View pass
      </OurButton>

      <div className="upcoming-header">
        <Link component="button" color="inherit" onClick={() => navigate('/bookings')}>
          View upcoming bookings
        </Link>
      </div>
    </NextBookingStyles>
  );
};

export default NextBooking;
