import React, { useContext, useEffect, useState } from 'react';
import { navigate } from '@reach/router';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import isToday from 'date-fns/isToday';
import Link from '@material-ui/core/Link';

import { AppContext } from '../../AppProvider';

import { DATE_FNS_OPTIONS } from '../../../constants/dates';
import { Booking } from '../../../types/api';

import { OurButton } from '../../../styles/MaterialComponents';
import NextBookingStyles from './NextBooking.styles';

const NextBooking: React.FC = () => {
  // Global state
  const { state } = useContext(AppContext);
  const { bookings } = state;

  // Local state
  const [booking, setBooking] = useState<Booking | undefined>();

  // Effects
  useEffect(() => {
    if (bookings) {
      // Find a booking for today
      setBooking(
        bookings.find((b) => isToday(parse(b.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS)))
      );
    }
  }, [bookings]);

  // Render
  if (!booking) {
    return null;
  }

  return (
    <NextBookingStyles>
      <h2>Today&apos;s Booking</h2>

      <h3>
        {format(
          parse(booking.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS),
          'do LLL',
          DATE_FNS_OPTIONS
        )}{' '}
        <span>@</span> {booking.office}
      </h3>

      <OurButton
        type="submit"
        variant="contained"
        color="primary"
        onClick={() => {
          navigate(`./booking/${booking?.id}`);
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
