import React, { useContext, useState, useEffect } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';

import Layout from '../../Layout/Layout';
import Loading from '../../Assets/LoadingSpinner';

import AdminStyles from './Admin.styles';
import { AppContext } from '../../AppProvider';
import { getBookings, cancelBooking } from '../../../lib/api';
import { formatError } from '../../../lib/app';

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Paper,
  useTheme,
  useMediaQuery,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Toolbar,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
} from '@material-ui/core';
import { isPast, endOfDay, format, addDays } from 'date-fns';
import { OurButton } from '../../../styles/MaterialComponents';
import { AddCircle, KeyboardArrowRight, KeyboardArrowLeft } from '@material-ui/icons';
import { Booking } from '../../../types/api';
import AdminHeader from './AdminHeader';
import BookingStyles from './BookingStyles';

const Admin: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user } = state;

  // Local state
  const [allBookings, setAllBookings] = useState<Booking[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [selectedOffice, setSelectedOffice] = React.useState('');
  const [deleteDialog, setDeleteDialog] = useState<undefined | Booking>(undefined);
  const [selectedDate, setSelectedDate] = React.useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Effects

  useEffect(() => {
    if (user && !user.permissions.canViewAdminPanel) {
      setTimeout(() => {
        // Bounce to home page
        navigate('/');
      }, 3000);
    } else if (user) {
      const firstOffice = user.permissions.officesCanManageBookingsFor[0];
      setSelectedOffice(firstOffice);
    }
  }, [user]);

  useEffect(() => {
    if (selectedOffice) {
      setLoading(true);
      // Retrieve bookings
      getBookings({ office: selectedOffice, date: selectedDate })
        .then((data) => {
          // Store in global state
          setAllBookings(data.filter((booking) => !isPast(endOfDay(new Date(booking.date)))));
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          dispatch({
            type: 'SET_ERROR',
            payload: formatError(err),
          });
        });
    }
  }, [dispatch, selectedOffice, selectedDate]);

  // Handlers
  const handleOfficeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedOffice(event.target.value as string);
  };

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

  if (!user) {
    return null;
  }

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
            <DialogContentText>Do you wish to cancel this booking?</DialogContentText>
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

  return (
    <Layout>
      <AdminStyles>
        {!user.permissions.canViewAdminPanel ? (
          <div className="redirect">
            <h2>Only for admins</h2>
            <p>You don&apos;t have an access to view this page, redirecting you to home...</p>
          </div>
        ) : loading ? (
          <Loading />
        ) : (
          <>
            <AdminHeader currentRoute={'home'} />
            <BookingStyles>
              <Paper>
                <section className="listing-container">
                  {selectedOffice && allBookings ? (
                    <>
                      <Toolbar>
                        <Typography variant="h6" id="tableTitle" component="div" color="primary">
                          Bookings
                        </Typography>
                        <div className="filters">
                          <FormControl>
                            <InputLabel id="demo-simple-select-outlined-label">Office</InputLabel>
                            <Select
                              labelId="demo-simple-select-outlined-label"
                              id="demo-simple-select-outlined"
                              value={selectedOffice}
                              onChange={handleOfficeChange}
                              label="Office"
                            >
                              {user.permissions.officesCanManageBookingsFor.map((office, index) => (
                                <MenuItem value={office} key={index}>
                                  {office}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <form noValidate>
                            <TextField
                              id="date"
                              label="Date"
                              type="date"
                              defaultValue={selectedDate}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              onChange={(e) => setSelectedDate(e.target.value)}
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
                                      <KeyboardArrowLeft />
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
                                      <KeyboardArrowRight />
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </form>
                          <Button
                            startIcon={<AddCircle />}
                            type="submit"
                            color="secondary"
                            onClick={() => navigate('/admin/createBooking')}
                            variant="outlined"
                            className="create-btn"
                          >
                            New booking
                          </Button>
                        </div>
                      </Toolbar>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>User</TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {allBookings.map((data, index) => {
                              return (
                                <TableRow key={index}>
                                  <TableCell>{data.user}</TableCell>
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
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  ) : (
                    <Loading />
                  )}
                </section>
              </Paper>
            </BookingStyles>
          </>
        )}
        {adminCancelDialog(deleteDialog)}
      </AdminStyles>
    </Layout>
  );
};

export default Admin;
