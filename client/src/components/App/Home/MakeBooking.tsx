import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { navigate } from '@reach/router';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import isToday from 'date-fns/isToday';
import isSameWeek from 'date-fns/isSameWeek';
import isSameMonth from 'date-fns/isSameMonth';
import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import BusinessIcon from '@material-ui/icons/Business';
import Tooltip from '@material-ui/core/Tooltip';
import EmojiTransportationIcon from '@material-ui/icons/EmojiTransportation';
import CachedIcon from '@material-ui/icons/Cached';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

import { AppContext } from '../../AppProvider';

import BookButton from '../../Assets/BookButton';
import { OurButton } from '../../../styles/MaterialComponents';

import { Booking, OfficeWithSlots, User } from '../../../types/api';
import { createBooking, cancelBooking, getUser } from '../../../lib/api';
import { formatError } from '../../../lib/app';
import { DATE_FNS_OPTIONS } from '../../../constants/dates';

import MakeBookingStyles from './MakeBooking.styles';

import BookingStatus from '../../Assets/BookingStatus';

// Types
type Props = {
  office: OfficeWithSlots;
  bookings: Booking[];
  refreshBookings: () => void;
};

type Week = {
  startOfWeek: Date;
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

// Constants
const RELOAD_TIME = 300000;

// Component
const MakeBooking: React.FC<Props> = (props) => {
  const { office, bookings, refreshBookings } = props;

  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { config, user } = state;

  // Local state
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | undefined>();
  const [buttonsLoading, setButtonsLoading] = useState(true);
  const [showTodayConfirmation, setShowTodayConfirmation] = useState(false);
  const [showReasonConfirmation, setShowReasonConfirmation] = useState(false);
  const [bookingDate, setBookingDate] = useState<Date | undefined>();
  const [bookingParking, setBookingParking] = useState(false);
  const [bookingReason, setBookingReason] = useState<string | undefined>();
  const [isAutoApprovedUser, setIsAutoApprovedUser] = useState<boolean>(false);
  const [searchedUser, setSearchedUser] = useState<User | undefined>();

  // Refs
  const reloadTimerRef = useRef<ReturnType<typeof setInterval> | undefined>();

  // Helper
  const setReloadTimer = useCallback(() => {
    reloadTimerRef.current = setInterval(() => {
      setButtonsLoading(true);

      refreshBookings();
    }, RELOAD_TIME);
  }, [refreshBookings]);

  const resetReloadTimer = () => {
    reloadTimerRef.current && clearInterval(reloadTimerRef.current);

    setReloadTimer();
  };

  const isReasonRequired = () => config?.reasonToBookRequired && !isAutoApprovedUser;

  // Effects
  useEffect(() => {
    // Periodically refresh bookings
    setReloadTimer();

    // Handle browser visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Clear timer
        reloadTimerRef.current && clearInterval(reloadTimerRef.current);
      } else {
        // Reload data & restart timer
        setButtonsLoading(true);

        setReloadTimer();
        refreshBookings();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      reloadTimerRef.current && clearInterval(reloadTimerRef.current);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setReloadTimer, refreshBookings]);

  useEffect(() => {
    // Set week numbers from available slots
    const weeks: Week[] = [];

    office.slots.forEach((s) => {
      // Get week
      const date = parse(s.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS);
      const weekStart = startOfWeek(date, DATE_FNS_OPTIONS);

      // Is it already in the list?
      if (!weeks.find((w) => w.startOfWeek.getTime() === weekStart.getTime())) {
        // Find total user bookings for this week
        const userBookings = bookings.filter((b) =>
          isSameWeek(parse(b.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS), date, DATE_FNS_OPTIONS)
        );

        weeks.push({
          startOfWeek: weekStart,
          bookings: userBookings.length,
        });
      }
    });

    setWeeks(weeks);
  }, [bookings, office]);

  useEffect(() => {
    if (weeks.length > 0) {
      setButtonsLoading(false);

      if (selectedWeek === undefined) {
        setSelectedWeek(0);
      }
    }
  }, [selectedWeek, weeks]);

  const getWeekLabel = (week: Week) => {
    const startDate = week.startOfWeek;
    const endDate = endOfWeek(startDate, DATE_FNS_OPTIONS);

    // Are dates in the same month
    const sameMonth = isSameMonth(startDate, endDate);

    // Set label
    const startLabel = format(startDate, 'LLL d', DATE_FNS_OPTIONS);
    const endLabel = sameMonth
      ? format(endDate, 'd', DATE_FNS_OPTIONS)
      : format(endDate, 'LLL d', DATE_FNS_OPTIONS);

    return `${startLabel} - ${endLabel}`;
  };

  useEffect(() => {
    if (user && weeks && weeks.length > 0) {
      const { id, quota: officeQuota, parkingQuota, slots } = office;
      const { quota: userQuota } = user;

      const rows: Row[] = [];

      // For each week
      weeks.forEach((w) => {
        // Find all days in the week
        const startDate = w.startOfWeek;
        const endDate = endOfWeek(w.startOfWeek, DATE_FNS_OPTIONS);

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
            const booking = bookings.find((b) => b.office.id === id && b.date === slot.date);

            // Total user bookings for this week
            const userWeekBookings = bookings.filter((b) =>
              isSameWeek(
                parse(b.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS),
                parse(slot.date, 'y-MM-dd', new Date(), DATE_FNS_OPTIONS),
                DATE_FNS_OPTIONS
              )
            );

            // Add day
            days.push({
              date: d,
              isBookable: true,
              available,
              availableCarPark,
              userCanBook: available > 0 && userWeekBookings.length < userQuota,
              booking,
            });
          } else {
            // Did we have a booking on this day?
            const booking = bookings.find(
              (b) => b.office.id === id && b.date === format(d, 'y-MM-dd', DATE_FNS_OPTIONS)
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

      setRows(rows);
    }
  }, [bookings, office, user, weeks]);

  useEffect(() => {
    if (user && config?.reasonToBookRequired) {
      // Get selected user
      getUser(user?.email)
        .then((searchedUser) => setSearchedUser(searchedUser))
        .catch((err) => {
          // Handle errors

          dispatch({
            type: 'SET_ALERT',
            payload: {
              message: formatError(err),
              color: 'error',
            },
          });
        });
    }
  }, [user, dispatch, config?.reasonToBookRequired]);

  useEffect(() => {
    if (user) {
      if (searchedUser?.autoApproved) {
        setIsAutoApprovedUser(true);
      }
    }
  }, [searchedUser?.autoApproved, user]);

  // Handlers
  const handleChangeWeek = (direction: 'forward' | 'backward') => {
    // Find index of current selected
    if (selectedWeek !== undefined) {
      setSelectedWeek(
        direction === 'forward'
          ? selectedWeek + 1
          : direction === 'backward'
          ? selectedWeek - 1
          : selectedWeek
      );
    }
  };

  const confirmTodayBooking = (
    handleCreateBooking: (date: Date, withParking: boolean) => void,
    date: Date,
    withParking: boolean
  ) => {
    if (isReasonRequired()) {
      setBookingDate(date);
      setBookingParking(withParking);

      if (isToday(date)) {
        setShowTodayConfirmation(true);
      } else {
        setShowReasonConfirmation(true);
      }
    } else {
      handleCreateBooking(date, withParking);
    }
  };

  const handleCreateBooking = (date: Date, withParking: boolean, reason?: string) => {
    if (user) {
      setButtonsLoading(true);

      // Reset auto-reload timer
      resetReloadTimer();

      // Create new booking
      const formattedDate = format(date, 'yyyy-MM-dd', DATE_FNS_OPTIONS);

      createBooking(user.email, formattedDate, office, withParking, reason)
        .then(() => {
          // Clear form
          setBookingDate(undefined);
          setBookingParking(false);
          setBookingReason(undefined);

          // Refresh DB
          refreshBookings();
        })
        .catch((err) => {
          // Refresh DB
          refreshBookings();

          // Handle errors
          setButtonsLoading(false);

          dispatch({
            type: 'SET_ALERT',
            payload: {
              message: formatError(err),
              color: 'error',
            },
          });
        });
    }
  };

  const handleCancelBooking = (booking: Booking) => {
    if (user) {
      setButtonsLoading(true);

      // Reset auto-reload timer
      resetReloadTimer();

      // Cancel existing booking
      cancelBooking(booking.id, user.email)
        .then(() => refreshBookings())
        .catch((err) => {
          // Refresh DB
          refreshBookings();

          // Handle errors
          setButtonsLoading(false);

          dispatch({
            type: 'SET_ALERT',
            payload: {
              message: formatError(err),
              color: 'error',
            },
          });
        });
    }
  };

  const handleClearOffice = () => {
    // Update global state
    dispatch({
      type: 'SET_OFFICE',
      payload: undefined,
    });
  };

  // Render
  if (!user) {
    return null;
  }

  return (
    <MakeBookingStyles>
      <div className="title">
        <h2>{office.name}</h2>

        <Link
          component="button"
          underline="always"
          color="primary"
          onClick={() => handleClearOffice()}
        >
          Change office
        </Link>
      </div>

      {isReasonRequired() && (
        <p className="notice">
          You will be asked to record your reason for going to work when you make a booking.
        </p>
      )}

      <ul>
        <li>
          You can make <span>{user.quota}</span> booking per week.
        </li>
        <li>
          {office.name} has a daily capacity of <span>{office.quota}</span>
          {office.parkingQuota > 0 ? (
            <>
              {` `}and car park capacity of <span>{office.parkingQuota}</span>.
            </>
          ) : (
            `.`
          )}
        </li>
      </ul>

      {weeks && weeks.length > 0 && selectedWeek !== undefined && (
        <>
          <Paper square className="bookings">
            <div className="menu">
              <div className="back">
                <IconButton
                  disabled={selectedWeek === 0}
                  onClick={() => handleChangeWeek('backward')}
                  size="small"
                >
                  <ArrowLeftIcon
                    fontSize="inherit"
                    className="icon"
                    color={selectedWeek === 0 ? 'disabled' : 'secondary'}
                  />
                </IconButton>
              </div>

              <div className="date">
                <h3>{getWeekLabel(weeks[selectedWeek])}</h3>
              </div>

              <div className="forward">
                <IconButton
                  disabled={selectedWeek === weeks.length - 1}
                  onClick={() => handleChangeWeek('forward')}
                  size="small"
                >
                  <ArrowRightIcon
                    fontSize="inherit"
                    className="icon"
                    color={selectedWeek === weeks.length - 1 ? 'disabled' : 'secondary'}
                  />
                </IconButton>
              </div>

              <div className="refresh">
                <Tooltip title="Refresh availability">
                  <IconButton
                    onClick={() => {
                      setButtonsLoading(true);

                      resetReloadTimer();
                      refreshBookings();
                    }}
                    disabled={buttonsLoading}
                  >
                    <CachedIcon color="primary" />
                  </IconButton>
                </Tooltip>
              </div>
            </div>

            <div className="details">
              <p className="quota">
                <span>{user.quota - weeks[selectedWeek].bookings}</span>{' '}
                {user.quota - weeks[selectedWeek].bookings === 1 ? 'booking' : 'bookings'} remaining
              </p>

              <p className="upcoming-bookings">
                <Link component="button" color="inherit" onClick={() => navigate('/bookings')}>
                  View bookings
                </Link>
              </p>
            </div>

            {rows
              .filter((row, index) => selectedWeek === index)
              .map((row, weekIndex) => (
                <div key={weekIndex} className="grid">
                  {row.days.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="row"
                      data-today={isToday(day.date)}
                      data-bookable={
                        day.isBookable && (day.userCanBook || day.booking) ? true : false
                      }
                    >
                      <div className="left">
                        <p className="date">{format(day.date, 'E do', DATE_FNS_OPTIONS)}</p>
                      </div>

                      {day.isBookable && (
                        <div className="right">
                          {day.booking ? (
                            <>
                              <Tooltip
                                title={
                                  isToday(day.date)
                                    ? "Today's booking can only be cancelled by administrators"
                                    : ''
                                }
                                placement="top-end"
                              >
                                <Link
                                  component="button"
                                  underline="always"
                                  className={`${buttonsLoading ? 'loading ' : ''}${
                                    isToday(day.date) ? 'disabled ' : ''
                                  }cancelBtn`}
                                  onClick={() =>
                                    !buttonsLoading &&
                                    day.booking &&
                                    !isToday(day.date) &&
                                    handleCancelBooking(day.booking)
                                  }
                                >
                                  Cancel
                                </Link>
                              </Tooltip>

                              <OurButton
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                  navigate(`./booking/${day.booking?.id}`);
                                }}
                                endIcon={
                                  day.booking?.parking ? (
                                    <EmojiTransportationIcon />
                                  ) : (
                                    <BusinessIcon />
                                  )
                                }
                              >
                                View Pass
                              </OurButton>
                            </>
                          ) : (
                            <div className="no-booking">
                              <div className="availability">
                                <BookingStatus
                                  officeQuota={office.quota}
                                  officeAvailable={day.available}
                                  parkingQuota={office.parkingQuota}
                                  parkingAvailable={day.availableCarPark}
                                />
                              </div>

                              {day.userCanBook && (
                                <div className="book">
                                  <BookButton
                                    onClick={(withParking) =>
                                      confirmTodayBooking(
                                        handleCreateBooking,
                                        day.date,
                                        withParking
                                      )
                                    }
                                    parkingQuota={office.parkingQuota}
                                    parkingAvailable={day.availableCarPark}
                                    buttonsLoading={buttonsLoading}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
          </Paper>

          <Dialog
            open={showTodayConfirmation}
            onClose={() => setShowTodayConfirmation(false)}
            disableBackdropClick
          >
            <DialogContent>
              <DialogContentText color="secondary">
                Today's booking can only be cancelled by administrators
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <OurButton
                onClick={() => setShowTodayConfirmation(false)}
                size="small"
                color="primary"
              >
                Cancel
              </OurButton>
              <OurButton
                onClick={() => {
                  if (isReasonRequired()) {
                    setShowTodayConfirmation(false);
                    setShowReasonConfirmation(true);
                  } else {
                    bookingDate && handleCreateBooking(bookingDate, bookingParking);
                  }
                }}
                variant="contained"
                size="small"
                color="secondary"
              >
                Confirm{bookingParking ? ` + Parking` : null}
              </OurButton>
            </DialogActions>
          </Dialog>

          <Dialog
            open={showReasonConfirmation}
            onClose={() => setShowReasonConfirmation(false)}
            disableBackdropClick
          >
            <DialogContent>
              <DialogContentText color="secondary">
                You can only leave home for work purposes where it is unreasonable for you to do
                your job from home. Please briefly explain why you cannot work from home.
              </DialogContentText>
              <TextField
                autoFocus
                label="Details"
                type="text"
                margin="normal"
                fullWidth
                multiline
                required
                value={bookingReason}
                onChange={(e) => setBookingReason(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <OurButton
                onClick={() => setShowReasonConfirmation(false)}
                size="small"
                color="primary"
              >
                Cancel
              </OurButton>
              <OurButton
                onClick={() => {
                  if (bookingDate && bookingReason && bookingReason.trim().length > 0) {
                    setShowReasonConfirmation(false);
                    handleCreateBooking(bookingDate, bookingParking, bookingReason);
                  }
                }}
                variant="contained"
                size="small"
                color="secondary"
              >
                Confirm{bookingParking ? ` + Parking` : null}
              </OurButton>
            </DialogActions>
          </Dialog>
        </>
      )}
    </MakeBookingStyles>
  );
};

export default MakeBooking;
