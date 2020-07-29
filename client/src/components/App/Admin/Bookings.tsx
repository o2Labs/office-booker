import React, { useContext, useState, useEffect, useCallback } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import parse from 'date-fns/parse';
import isPast from 'date-fns/isPast';
import endOfDay from 'date-fns/endOfDay';
import format from 'date-fns/format';
import addDays from 'date-fns/addDays';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
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

const Bookings: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user, offices } = state;

  // Local state
  const [loading, setLoading] = useState(true);
  const [selectedOffice, setSelectedOffice] = useState<Office | undefined>();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [allBookings, setAllBookings] = useState<Booking[] | undefined>();

  const [deleteBooking, setDeleteBooking] = useState<undefined | Booking>();

  // Theme
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Helpers
  const getAllBookings = useCallback(() => {
    if (selectedOffice) {
      getBookings({ office: selectedOffice.name, date: format(selectedDate, 'yyyy-MM-dd') })
        .then((data) => setAllBookings(data))
        .catch((err) => {
          // Handle errors
          setLoading(false);

          dispatch({
            type: 'SET_ERROR',
            payload: formatError(err),
          });
        });
    }
  }, [selectedOffice, selectedDate, dispatch]);

  const findOffice = useCallback((name: Office['name']) => offices.find((o) => o.name === name), [
    offices,
  ]);

  // Effects
  useEffect(() => {
    if (user) {
      // Get all offices
      getOffices()
        .then((data) =>
          // Store in global state
          dispatch({
            type: 'SET_OFFICES',
            payload: data,
          })
        )
        .catch((err) => {
          // Handle errors
          setLoading(false);

          dispatch({
            type: 'SET_ERROR',
            payload: formatError(err),
          });
        });
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (user && offices.length > 0 && !selectedOffice) {
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
    if (allBookings) {
      // Wait for local state to be ready
      setLoading(false);
    }
  }, [allBookings]);

  // Handlers
  const handleCancelBooking = () => {
    if (deleteBooking) {
      cancelBooking(deleteBooking.id, deleteBooking.user)
        .then(() => {
          // Clear selected booking
          setDeleteBooking(undefined);

          dispatch({
            type: 'SET_ALERT',
            payload: {
              message: 'Booking cancelled',
              color: 'success',
            },
          });

          // Retrieve updated bookings
          getAllBookings();
        })
        .catch((err) => {
          // Handle error
          dispatch({ type: 'SET_ERROR', payload: err });
        });
    }
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
                </div>

                <TableContainer className="table">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell className="table-header">User</TableCell>
                        {selectedOffice.parkingQuota > 0 && (
                          <TableCell className="table-header">Parking</TableCell>
                        )}
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allBookings && allBookings.length > 0 ? (
                        allBookings.map((data, index) => (
                          <TableRow key={index}>
                            <TableCell>{data.user}</TableCell>
                            {selectedOffice.parkingQuota > 0 && (
                              <TableCell>{data.parking ? 'Yes' : 'No'}</TableCell>
                            )}
                            <TableCell align="right">
                              <div className="btn-container">
                                <OurButton
                                  type="submit"
                                  variant="contained"
                                  color="secondary"
                                  size="small"
                                  onClick={() => setDeleteBooking(data)}
                                >
                                  Cancel
                                </OurButton>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
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

        {deleteBooking && (
          <Dialog fullScreen={fullScreen} open={true} onClose={() => setDeleteBooking(undefined)}>
            <DialogTitle>{'Are you sure you want to cancel this booking?'}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Booking for <strong>{deleteBooking.user}</strong> on{' '}
                <strong>
                  {format(parse(deleteBooking.date, 'yyyy-MM-dd', new Date()), 'do LLLL')}
                </strong>{' '}
                for <strong>{deleteBooking.office}</strong>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteBooking(undefined)} color="primary" autoFocus>
                No
              </Button>
              <Button autoFocus onClick={() => handleCancelBooking()} color="primary">
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
