import React, { useContext, useState, useEffect, useCallback } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import parseISO from 'date-fns/parseISO';
import format from 'date-fns/format';
import addDays from 'date-fns/addDays';
import isPast from 'date-fns/isPast';
import isToday from 'date-fns/isToday';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import { DatePicker } from '@material-ui/pickers';

import { AppContext } from '../../AppProvider';

import Loading from '../../Assets/LoadingSpinner';
import AdminLayout from './Layout/Layout';

import { OurButton } from '../../../styles/MaterialComponents';

import { getBookings, cancelBooking, getOffices } from '../../../lib/api';
import { formatError } from '../../../lib/app';
import { Booking, Office } from '../../../types/api';

import BookingStyles from './Bookings.styles';

// Types

type SortOrder = 'asc' | 'desc';

// Helpers
const sortData = (data: Booking[], key: keyof Booking, order: SortOrder): Booking[] | undefined => {
  if (key === 'user') {
    return order === 'desc'
      ? data.sort((a, b) => b.user.localeCompare(a.user))
      : data.sort((a, b) => a.user.localeCompare(b.user));
  }

  if (key === 'parking') {
    return order === 'desc'
      ? data.sort((a, b) => Number(a.parking) - Number(b.parking))
      : data.sort((a, b) => Number(b.parking) - Number(a.parking));
  }

  return data;
};

// Component
const Bookings: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user } = state;

  // Local state
  const [loading, setLoading] = useState(true);
  const [offices, setOffices] = useState<Office[] | undefined>();

  const [selectedOffice, setSelectedOffice] = useState<Office | undefined>();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [dbBookings, setDbBookings] = useState<Booking[] | undefined>();
  const [sortedBookings, setSortedBookings] = useState<Booking[] | undefined>();

  const [sortBy, setSortBy] = useState<keyof Booking>('user');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [bookingToCancel, setBookingToCancel] = useState<undefined | Booking>();

  // Theme
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Helpers
  const getAllBookings = useCallback(() => {
    if (selectedOffice) {
      getBookings({ office: selectedOffice.name, date: format(selectedDate, 'yyyy-MM-dd') })
        .then((data) => setDbBookings(data))
        .catch((err) => {
          // Handle errors
          setLoading(false);

          dispatch({
            type: 'SET_ALERT',
            payload: {
              message: formatError(err),
              color: 'error',
            },
          });
        });
    }
  }, [selectedOffice, selectedDate, dispatch]);

  const findOffice = useCallback(
    (name: Office['name']) => offices && offices.find((o) => o.name === name),
    [offices]
  );

  // Effects
  useEffect(() => {
    if (user) {
      // Get all offices admin can manage
      getOffices()
        .then((data) =>
          setOffices(
            data.filter((office) =>
              user.permissions.officesCanManageBookingsFor.includes(office.name)
            )
          )
        )
        .catch((err) => {
          // Handle errors
          setLoading(false);

          dispatch({
            type: 'SET_ALERT',
            payload: {
              message: formatError(err),
              color: 'error',
            },
          });
        });
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (user && offices && offices.length > 0 && !selectedOffice) {
      // Retrieve first office user can manage bookings for
      setSelectedOffice(findOffice(user.permissions.officesCanManageBookingsFor[0]));
    }
  }, [user, offices, selectedOffice, findOffice]);

  useEffect(() => {
    if (selectedOffice) {
      // Retrieve bookings
      getAllBookings();
    }
  }, [dispatch, selectedOffice, selectedDate, getAllBookings]);

  useEffect(() => {
    if (dbBookings) {
      // Sort it!
      setSortedBookings(sortData([...dbBookings], sortBy, sortOrder));
    }
  }, [dbBookings, sortBy, sortOrder]);

  useEffect(() => {
    if (loading && sortedBookings) {
      // Wait for local state to be ready
      setLoading(false);
    }
  }, [loading, sortedBookings]);

  // Handlers
  const handleSort = (key: keyof Booking) => {
    if (key === sortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(key);
    }
  };

  const handleCancelBooking = (booking: Booking) => {
    cancelBooking(booking.id, booking.user)
      .then(() => {
        // Clear selected booking
        setBookingToCancel(undefined);

        // Retrieve updated bookings
        getAllBookings();

        // Show confirmation alert
        dispatch({
          type: 'SET_ALERT',
          payload: {
            message: 'Booking cancelled',
            color: 'success',
          },
        });
      })
      .catch((err) =>
        dispatch({
          type: 'SET_ALERT',
          payload: {
            message: formatError(err),
            color: 'error',
          },
        })
      );
  };

  // Render
  if (!user) {
    return null;
  }

  return (
    <AdminLayout currentRoute="bookings">
      <BookingStyles>
        {loading ? (
          <Loading />
        ) : (
          <>
            <h3>Bookings</h3>

            <OurButton
              startIcon={<AddCircleIcon />}
              type="submit"
              color="secondary"
              onClick={() => navigate('/admin/booking')}
              variant="contained"
              size="small"
            >
              New Booking
            </OurButton>

            {selectedOffice && (
              <Paper square className="table-container">
                <div className="filter">
                  <FormControl className="filter-office">
                    <InputLabel id="office-label">Office</InputLabel>
                    <Select
                      labelId="office-label"
                      id="office"
                      value={selectedOffice.name}
                      onChange={(e) => setSelectedOffice(findOffice(e.target.value as string))}
                    >
                      {user.permissions.officesCanManageBookingsFor.map((office, index) => (
                        <MenuItem value={office} key={index}>
                          {office}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <div className="filter-date">
                    <IconButton
                      onClick={() => setSelectedDate(addDays(new Date(selectedDate), -1))}
                      className="date-arrow"
                    >
                      <KeyboardArrowLeftIcon />
                    </IconButton>

                    <DatePicker
                      autoOk
                      disableToolbar
                      variant="inline"
                      label="Date"
                      format="dd/MM/yyyy"
                      value={selectedDate}
                      onChange={(date) => setSelectedDate(date as Date)}
                      className="date-picker"
                    />

                    <IconButton
                      onClick={() => setSelectedDate(addDays(new Date(selectedDate), 1))}
                      className="date-arrow"
                    >
                      <KeyboardArrowRightIcon />
                    </IconButton>
                  </div>

                  <div className="total-bookings">
                      <InputLabel className="bookings-count-label">Bookings made on this day:</InputLabel>
                    <span>{sortedBookings && sortedBookings.length}</span>
                  </div>
                </div>

                <TableContainer className="table">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell className="table-header">
                          <TableSortLabel
                            active={sortBy === 'user'}
                            direction={sortOrder}
                            onClick={() => handleSort('user')}
                          >
                            User
                          </TableSortLabel>
                        </TableCell>
                        {selectedOffice.parkingQuota > 0 && (
                          <TableCell className="table-header">
                            <TableSortLabel
                              active={sortBy === 'parking'}
                              direction={sortOrder}
                              onClick={() => handleSort('parking')}
                            >
                              Parking
                            </TableSortLabel>
                          </TableCell>
                        )}
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedBookings && sortedBookings.length > 0 ? (
                        sortedBookings.map((booking, index) => {
                          const parsedDate = parseISO(booking.date);

                          return (
                            <TableRow key={index}>
                              <TableCell>{booking.user}</TableCell>
                              {selectedOffice.parkingQuota > 0 && (
                                <TableCell>{booking.parking ? 'Yes' : 'No'}</TableCell>
                              )}
                              {isToday(parsedDate) || !isPast(parsedDate) ? (
                                <TableCell align="right">
                                  <div className="btn-container">
                                    <OurButton
                                      type="submit"
                                      variant="contained"
                                      color="secondary"
                                      size="small"
                                      onClick={() => setBookingToCancel(booking)}
                                    >
                                      Cancel
                                    </OurButton>
                                  </div>
                                </TableCell>
                              ) : (
                                <TableCell />
                              )}
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell>No bookings found</TableCell>
                          {selectedOffice.parkingQuota > 0 && <TableCell />}
                          <TableCell />
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </>
        )}

        {bookingToCancel && (
          <Dialog fullScreen={fullScreen} open={true} onClose={() => setBookingToCancel(undefined)}>
            <DialogTitle>{'Are you sure you want to cancel this booking?'}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Booking for <strong>{bookingToCancel.user}</strong> on{' '}
                <strong>{format(parseISO(bookingToCancel.date), 'do LLLL')}</strong> for{' '}
                <strong>{bookingToCancel.office}</strong>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setBookingToCancel(undefined)} color="primary" autoFocus>
                No
              </Button>
              <Button
                autoFocus
                onClick={() => handleCancelBooking(bookingToCancel)}
                color="primary"
              >
                Yes
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </BookingStyles>
    </AdminLayout>
  );
};

export default Bookings;
