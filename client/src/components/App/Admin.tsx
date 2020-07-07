import React, { useContext, useState, useEffect } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';

import Layout from '../Layout/Layout';
import Loading from '../Assets/LoadingSpinner';

import AdminStyles from './Admin.styles';
import { AppContext } from '../AppProvider';
import { getBookings, cancelBooking } from '../../lib/api';
import { formatError } from '../../lib/app';

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
} from '@material-ui/core';
import { isToday, isPast } from 'date-fns';
import { OurButton, SubButton } from '../../styles/MaterialComponents';
import { Booking } from '../../types/api';
import AdminHeader from './AdminHeader';
import BookingStyles from './BookingStyles';

const Admin: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user } = state;

  // Local state
  const [allBookings, setAllBookings] = useState<Booking[] | undefined>(undefined);
  const [filteredBookings, setFilteredBookings] = useState<Booking[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [showToday, setShowToday] = useState(false);
  const [selectedOffice, setSelectedOffice] = React.useState('');
  const [deleteDialog, setDeleteDialog] = useState<undefined | Booking>(undefined);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Effects
  useEffect(() => {
    if (user && !user.permissions.canViewAdminPanel) {
      setTimeout(() => {
        // Bounce to home page
        navigate('/');
      }, 3000);
    } else if (user && selectedOffice) {
      setLoading(true);
      // Retrieve bookings
      getBookings({ office: selectedOffice })
        .then((data) => {
          // Store in global state
          setAllBookings(data.filter((booking) => !isPast(new Date(booking.date))));
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
  }, [dispatch, selectedOffice, user]);

  useEffect(() => {
    setFilteredBookings(
      showToday ? allBookings?.filter((booking) => isToday(new Date(booking.date))) : allBookings
    );
  }, [allBookings, showToday]);

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

  const handleToday = () => setShowToday(!showToday);

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
                <h3>Office</h3>
                <section className="select-container">
                  <FormControl variant="outlined">
                    <InputLabel id="demo-simple-select-outlined-label">Select Office</InputLabel>
                    <Select
                      labelId="demo-simple-select-outlined-label"
                      id="demo-simple-select-outlined"
                      value={selectedOffice}
                      onChange={handleOfficeChange}
                      label="Office"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {user.permissions.officesCanManageBookingsFor.map((office, index) => (
                        <MenuItem value={office} key={index}>
                          {office}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </section>

                <h3>Booked Users</h3>
                <section className="listing-container">
                  {selectedOffice && filteredBookings ? (
                    <>
                      <div className="btn-container">
                        <OurButton
                          type="submit"
                          variant="contained"
                          color="primary"
                          onClick={() => navigate('/admin/createBooking')}
                        >
                          Create New Booking
                        </OurButton>
                        <SubButton
                          type="submit"
                          variant="outlined"
                          onClick={handleToday}
                          size="small"
                        >
                          {showToday ? 'Show All' : 'Show Only Today'}
                        </SubButton>
                      </div>

                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>User</TableCell>
                              <TableCell>Date</TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredBookings.map((data, index) => {
                              if (data.office === selectedOffice) {
                                if (showToday) {
                                  return (
                                    isToday(new Date(data.date)) && (
                                      <TableRow key={index}>
                                        <TableCell>{data.user}</TableCell>
                                        <TableCell>{data.date}</TableCell>
                                        <TableCell>
                                          {user.permissions.officesCanManageBookingsFor.includes(
                                            data.office
                                          ) ? (
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
                                          ) : null}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  );
                                }
                                return (
                                  <TableRow key={index}>
                                    <TableCell>{data.user}</TableCell>
                                    <TableCell>{data.date}</TableCell>
                                    <TableCell>
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
                              } else {
                                return null;
                              }
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  ) : (
                    <p>No office selected</p>
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
