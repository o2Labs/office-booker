import React, { useContext, useEffect, useState } from 'react';
import { navigate } from '@reach/router';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import isToday from 'date-fns/isToday';
import isSameDay from 'date-fns/isSameDay';
import isSameWeek from 'date-fns/isSameWeek';
import isSameMonth from 'date-fns/isSameMonth';
import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';

import { AppContext } from '../../AppProvider';

import { Booking } from '../../../types/api';
import { createBooking, cancelBooking } from '../../../lib/api';
import { formatError } from '../../../lib/app';
import { DATE_FNS_OPTIONS } from '../../../constants/dates';

import { OurButton } from '../../../styles/MaterialComponents';
import MakeBookingStyles from './MakeBooking.styles';

import BookButton from '../../Assets/BookButton';
import { LocalParking, PermContactCalendar } from '@material-ui/icons';
import { Tooltip } from '@material-ui/core';

// Types
type Week = {
  id: number;
  bookings: number;
};

type NonBookableDay = {
  date: Date;
  isBookable: false;
  booking?: Booking;
};

type BookableDay = {
  date: Date;
  isBookable: true;
  available: number;
  availableCarPark: number;
  userCanBook: boolean;
  booking?: Booking;
};

type Day = BookableDay | NonBookableDay;

type Row = {
  week: Week;
  start: Date;
  end: Date;
  days: Day[];
};

const MakeBooking: React.FC = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { currentOffice, bookings, user } = state;

  // Local state
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week | undefined>();
  const [selectedWeekLabel, setSelectedWeekLabel] = useState<string | undefined>();
  const [buttonsLoading, setButtonsLoading] = useState(true);

  // Effects
  useEffect(() => {
    // Set week numbers from available slots
    const weeks: Week[] = [];

    if (currentOffice && bookings) {
      const { slots } = currentOffice;

      slots.forEach((s) => {
        // Get week
        const date = parse(s.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS);
        const week = parseInt(format(date, 'w', DATE_FNS_OPTIONS));

        // Is it already in the list?
        if (!weeks.find((w) => w.id === week)) {
          // Find total user bookings for this week
          const userBookings = bookings.filter((b) =>
            isSameWeek(
              parse(b.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS),
              date,
              DATE_FNS_OPTIONS
            )
          );

          weeks.push({
            id: week,
            bookings: userBookings.length,
          });
        }
      });
    }

    setWeeks(weeks);
  }, [bookings, currentOffice]);

  useEffect(() => {
    if (weeks.length > 0) {
      setButtonsLoading(false);

      if (selectedWeek) {
        // Reset selected week (to refresh total bookings)
        const index = weeks.findIndex((w) => w.id === selectedWeek.id);

        if (index !== -1) {
          setSelectedWeek(weeks[index]);
        }
      } else {
        // Default to first week
        setSelectedWeek(weeks[0]);
      }
    }
  }, [selectedWeek, weeks]);

  useEffect(() => {
    if (selectedWeek) {
      // Calculate start and end of week
      const weekDate = parse(selectedWeek.id.toString(), 'w', new Date(), DATE_FNS_OPTIONS);

      const startDate = startOfWeek(weekDate, DATE_FNS_OPTIONS);
      const endDate = endOfWeek(startDate, DATE_FNS_OPTIONS);

      // Are dates in the same month
      const sameMonth = isSameMonth(startDate, endDate);

      // Set label
      const startLabel = format(startDate, 'LLL d', DATE_FNS_OPTIONS);
      const endLabel = sameMonth
        ? format(endDate, 'd', DATE_FNS_OPTIONS)
        : format(endDate, 'LLL d', DATE_FNS_OPTIONS);

      setSelectedWeekLabel(`${startLabel} - ${endLabel}`);
    }
  }, [selectedWeek, weeks]);

  useEffect(() => {
    if (weeks && weeks.length > 0 && currentOffice && user && bookings) {
      const { name, quota: officeQuota, parkingQuota, slots } = currentOffice;
      const { quota: userQuota } = user;

      const rows: Row[] = [];

      // For each week
      weeks.forEach((w) => {
        // Find all days in the week
        const startDate = startOfWeek(
          parse(w.id.toString(), 'w', new Date(), DATE_FNS_OPTIONS),
          DATE_FNS_OPTIONS
        );
        const endDate = endOfWeek(
          parse(w.id.toString(), 'w', new Date(), DATE_FNS_OPTIONS),
          DATE_FNS_OPTIONS
        );

        const weekDays = eachDayOfInterval({
          start: startDate,
          end: endDate,
        });

        // For each day
        const days: Row['days'] = [];

        weekDays.forEach((d) => {
          // Is the date in the slots?
          const slot = slots.find((s) => format(d, 'y-MM-dd', DATE_FNS_OPTIONS) === s.date);

          if (slot) {
            // Calculate available spaces
            const available = officeQuota - slot.booked;
            const availableCarPark = parkingQuota - slot.bookedParking;

            // Find any user booking for this office/slot
            const booking = bookings.find((b) => b.office === name && b.date === slot.date);

            // Total user bookings for this week
            const userWeekBookings = bookings.filter((b) =>
              isSameWeek(
                parse(b.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS),
                parse(slot.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS),
                DATE_FNS_OPTIONS
              )
            );

            // Did the user booked this day
            const userDayBooking = userWeekBookings.find((b) =>
              isSameDay(parse(b.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS), d)
            );

            // Add day
            days.push({
              date: d,
              isBookable: true,
              available,
              availableCarPark,
              userCanBook: available > 0 && userWeekBookings.length < userQuota && !userDayBooking,
              booking,
            });
          } else {
            // Did we have a booking on this day?
            const booking = bookings.find(
              (b) => b.office === name && b.date === format(d, 'y-MM-dd', DATE_FNS_OPTIONS)
            );

            // Not in range
            days.push({
              date: d,
              isBookable: false,
              booking,
            });
          }
        });

        // Add to rows
        rows.push({
          week: w,
          start: startDate,
          end: endDate,
          days,
        });
      });
      console.log('state', state);
      console.log('rows', rows);
      setRows(rows);
    }
  }, [bookings, currentOffice, user, weeks]);

  // Handlers
  const handleChangeWeek = (direction: 'forward' | 'backward') => {
    // Find index of current selected
    if (selectedWeek) {
      const index = weeks.findIndex((w) => w.id === selectedWeek.id);

      if (index !== -1) {
        setSelectedWeek(
          weeks[direction === 'forward' ? index + 1 : direction === 'backward' ? index - 1 : index]
        );
      }
    }
  };

  const handleCreateBooking = (date: Date, withParking: boolean) => {
    const { user, currentOffice } = state;

    if (user && currentOffice) {
      setButtonsLoading(true);

      // Create new booking
      const formattedDate = format(date, 'yyyy-MM-dd', DATE_FNS_OPTIONS);

      createBooking(user.email, formattedDate, currentOffice.name, withParking)
        .then((data) => {
          // Add booking to global state
          dispatch({
            type: 'ADD_BOOKING',
            payload: data,
          });

          // Update office counter
          dispatch({
            type: 'INCREASE_OFFICE_SLOT',
            payload: {
              office: currentOffice.name,
              date: formattedDate,
            },
          });
        })
        .catch((err) =>
          dispatch({
            type: 'SET_ERROR',
            payload: formatError(err),
          })
        );
    }
  };

  const handleCancelBooking = (booking: Booking) => {
    const { user, currentOffice } = state;

    if (user && currentOffice) {
      setButtonsLoading(true);

      // Cancel existing booking
      cancelBooking(booking.id, user.email)
        .then(() => {
          // Remove booking from global state
          dispatch({
            type: 'REMOVE_BOOKING',
            payload: booking.id,
          });

          // Update office counter
          dispatch({
            type: 'DECREASE_OFFICE_SLOT',
            payload: {
              office: currentOffice.name,
              date: booking.date,
            },
          });
        })
        .catch((err) =>
          dispatch({
            type: 'SET_ERROR',
            payload: formatError(err),
          })
        );
    }
  };

  const remainderIndicator = (totalQuantity: number, step: number, leftQuantity: number) =>
    totalQuantity / step > leftQuantity ? 'Low' : 'Good';

  // Render
  if (!currentOffice || !user) {
    return null;
  }

  return (
    <MakeBookingStyles>
      <h2>{currentOffice.name}</h2>

      <ul>
        <li>
          You can make <span>{user.quota}</span> booking per week.
        </li>
        <li>
          {currentOffice.name} has a daily capacity of <span>{currentOffice.quota}</span>.
        </li>
        <li>
          And a daily car park capacity of <span>{currentOffice.parkingQuota}</span>.
        </li>
      </ul>

      {weeks && weeks.length > 0 && selectedWeek && (
        <Paper square className="bookings">
          <div className="menu">
            <div className="back">
              <IconButton
                disabled={selectedWeek.id === weeks[0].id}
                onClick={() => handleChangeWeek('backward')}
                size="small"
              >
                <ArrowLeftIcon
                  fontSize="inherit"
                  className="icon"
                  color={selectedWeek.id === weeks[0].id ? 'disabled' : 'secondary'}
                />
              </IconButton>
            </div>

            <div className="date">
              <h3>{selectedWeekLabel}</h3>
            </div>

            <div className="forward">
              <IconButton
                disabled={selectedWeek.id === weeks[weeks.length - 1].id}
                onClick={() => handleChangeWeek('forward')}
                size="small"
              >
                <ArrowRightIcon
                  fontSize="inherit"
                  className="icon"
                  color={selectedWeek.id === weeks[weeks.length - 1].id ? 'disabled' : 'secondary'}
                />
              </IconButton>
            </div>
          </div>

          <div className="details">
            <p className="quota">
              <span>{user.quota - selectedWeek.bookings}</span>{' '}
              {user.quota - selectedWeek.bookings === 1 ? 'booking' : 'bookings'} remaining
            </p>

            <p className="upcoming-bookings">
              <Link component="button" color="inherit" onClick={() => navigate('/bookings')}>
                View bookings
              </Link>
            </p>
          </div>

          {rows.map((row) => (
            <div key={row.week.id} className="grid" hidden={selectedWeek.id !== row.week.id}>
              {row.days.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="row"
                  data-today={isToday(day.date)}
                  data-bookable={day.isBookable && (day.userCanBook || day.booking)}
                >
                  <div className="left">
                    <p className="date">{format(day.date, 'E do', DATE_FNS_OPTIONS)}</p>
                  </div>
                  <div className="right">
                    {day.booking ? (
                      <>
                        {day.isBookable && !isToday(day.date) && (
                          <Link
                            component="button"
                            underline="always"
                            className={`${(buttonsLoading && 'loading') || undefined} cancelBtn`}
                            onClick={() =>
                              !buttonsLoading && day.booking && handleCancelBooking(day.booking)
                            }
                          >
                            Cancel Booking
                          </Link>
                        )}
                      </>
                    ) : day.isBookable ? (
                      <div className="availability">
                        <Tooltip title={`${day.available} Office space Left`} arrow>
                          <OurButton size="small">
                            <PermContactCalendar />
                            {remainderIndicator(currentOffice.quota, 2, day.available)}
                          </OurButton>
                        </Tooltip>
                        {day.availableCarPark && currentOffice.parkingQuota ? (
                          <Tooltip title={`${day.availableCarPark} Car park space left`} arrow>
                            <OurButton size="small">
                              <LocalParking />
                              {remainderIndicator(
                                currentOffice.parkingQuota,
                                2,
                                day.availableCarPark
                              )}
                            </OurButton>
                          </Tooltip>
                        ) : null}
                      </div>
                    ) : null}
                    {day.isBookable && day.booking && (
                      <OurButton
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          navigate(`./booking/${day.booking?.id}`);
                        }}
                      >
                        View Pass
                      </OurButton>
                    )}
                    {day.isBookable && day.userCanBook && (
                      <BookButton
                        onClick={(e) => handleCreateBooking(day.date, e.withParking)}
                        availableCarPark={day.availableCarPark}
                        buttonsLoading={buttonsLoading}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </Paper>
      )}
    </MakeBookingStyles>
  );
};

export default MakeBooking;
