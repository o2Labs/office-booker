import React, { useContext, useState, useEffect } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
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
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';

import { AppContext } from '../../AppProvider';

import Loading from '../../Assets/LoadingSpinner';
import AdminLayout from './Layout/Layout';

import { OurButton } from '../../../styles/MaterialComponents';

import { getBookings, cancelBooking } from '../../../lib/api';
import { formatError } from '../../../lib/app';
import { Booking } from '../../../types/api';

import BookingStyles from './Bookings.styles';

const Bookings: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user } = state;

  // Local state
  const [allBookings, setAllBookings] = useState<Booking[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [selectedOffice, setSelectedOffice] = React.useState('');
  const [deleteDialog, setDeleteDialog] = useState<undefined | Booking>(undefined);
  const [selectedDate, setSelectedDate] = React.useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Effects
  useEffect(() => {
    if (user) {
      // Retrieve first office user can manage bookings for
      const firstOffice = user.permissions.officesCanManageBookingsFor[0];

      setSelectedOffice(firstOffice);
    }
  }, [user]);

  useEffect(() => {
    if (selectedOffice) {
      // Retrieve bookings
      getBookings({ office: selectedOffice, date: selectedDate })
        .then((data) => {
          setAllBookings(data.filter((booking) => !isPast(endOfDay(new Date(booking.date)))));
        })
        .catch((err) => {
          // Handle errors
          setLoading(false);

          dispatch({
            type: 'SET_ERROR',
            payload: formatError(err),
          });
        });
    }
  }, [dispatch, selectedOffice, selectedDate]);

  useEffect(() => {
    if (allBookings) {
      // Wait for local state to be ready
      setLoading(false);
    }
  }, [allBookings]);

  // Handlers
  const handleAdminCancelBooking = async (booking: Booking) => {
    setLoading(true);

    // Cancel existing booking
    await cancelBooking(booking.id, booking.user)
      .then(() => {
        setLoading(false);
        // Hack: trigger reload of bookings
        setSelectedOffice('');
        setSelectedOffice(selectedOffice);
      })
      .catch((err) => {
        setLoading(false);
        dispatch({ type: 'SET_ERROR', payload: err });
      });
  };

  const adminCancelDialog = (booking?: Booking) => {
    if (booking === undefined) {
      return null;
    }
    return (
      <div>
        <Dialog
          fullScreen={fullScreen}
          open={true}
          onClose={() => setDeleteDialog(undefined)}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">
            {'Are you sure you want to cancel this booking?'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Booking for <b>{booking.user}</b> on <b>{format(new Date(booking.date), 'do MMM')}</b>{' '}
              for <b>{booking.office}</b>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(undefined)} color="primary" autoFocus>
              No
            </Button>
            <Button
              autoFocus
              onClick={async () => {
                try {
                  await handleAdminCancelBooking(booking);
                  setDeleteDialog(undefined);
                } catch (error) {
                  dispatch({
                    type: 'SET_ERROR',
                    payload: formatError(error),
                  });
                }
              }}
              color="primary"
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  };

  // Render
  if (!user) {
    return null;
  }

  return (
    <AdminLayout>
      <BookingStyles>
        {loading ? (
          <Loading />
        ) : (
          <>
            <h3>Bookings</h3>

            <Button
              startIcon={<AddCircleIcon />}
              type="submit"
              color="secondary"
              onClick={() => navigate('/admin/createBooking')}
              variant="contained"
              size="small"
            >
              New Booking
            </Button>

            <Paper square className="table-container">
              <div className="filter">
                <FormControl className="filter-office">
                  <InputLabel id="office-label">Office</InputLabel>
                  <Select
                    labelId="office-label"
                    id="office"
                    value={selectedOffice}
                    onChange={(e) => setSelectedOffice(e.target.value as string)}
                  >
                    {user.permissions.officesCanManageBookingsFor.map((office, index) => (
                      <MenuItem value={office} key={index}>
                        {office}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  id="date"
                  label="Date"
                  type="date"
                  className="filter-date"
                  defaultValue={format(new Date(), 'yyyy-MM-dd')}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton
                          edge="start"
                          onClick={() =>
                            setSelectedDate(
                              format(addDays(new Date(selectedDate), -1), 'yyyy-MM-dd')
                            )
                          }
                        >
                          <KeyboardArrowLeftIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() =>
                            setSelectedDate(
                              format(addDays(new Date(selectedDate), 1), 'yyyy-MM-dd')
                            )
                          }
                        >
                          <KeyboardArrowRightIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>

              <TableContainer className="table">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className="table-header">User</TableCell>
                      <TableCell className="table-header">Parking</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allBookings && allBookings.length > 0 ? (
                      allBookings.map((data, index) => (
                        <TableRow key={index}>
                          <TableCell>{data.user}</TableCell>
                          <TableCell>{data.parking ? 'Yes' : 'No'}</TableCell>
                          <TableCell align="right">
                            <div className="btn-container">
                              <OurButton
                                type="submit"
                                variant="contained"
                                color="secondary"
                                size="small"
                                onClick={() => setDeleteDialog(data)}
                              >
                                Cancel Booking
                              </OurButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell>No bookings found</TableCell>
                        <TableCell />
                        <TableCell />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}

        {adminCancelDialog(deleteDialog)}
      </BookingStyles>
    </AdminLayout>
  );
};

export default Bookings;
