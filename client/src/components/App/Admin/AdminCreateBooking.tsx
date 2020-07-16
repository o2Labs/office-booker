import React, { useContext, useState, useEffect } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';

import Layout from '../../Layout/Layout';
import Loading from '../../Assets/LoadingSpinner';

import AdminCreateBookingStyles from './AdminCreateBooking.styles';
import { AppContext } from '../../AppProvider';
import { getOffices, createBooking } from '../../../lib/api';
import { formatError } from '../../../lib/app';

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@material-ui/core';
import { OfficeSlot } from '../../../types/api';
import { OurButton } from '../../../styles/MaterialComponents';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import AdminHeader from './AdminHeader';
import { validateEmail } from '../../../lib/emailValidation';

const AdminCreateBooking: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user } = state;

  // Local state
  const [loading, setLoading] = useState(false);
  const [selectedOffice, setSelectedOffice] = React.useState('');
  const [selectedBookingDate, setSelectedBookingDate] = React.useState('');
  const [email, setEmail] = useState('');
  const [parking, setParking] = useState<boolean | undefined>();
  const [officeSlots, setOfficeSlots] = useState<OfficeSlot[] | undefined>(undefined);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);

  // Effects
  useEffect(() => {
    if (user && user.permissions.officesCanManageBookingsFor.length > 0) {
      // Get all offices
      getOffices()
        .then((data) =>
          // Store in global state
          dispatch({
            type: 'SET_OFFICES',
            payload: data,
          })
        )
        .catch((err) =>
          dispatch({
            type: 'SET_ERROR',
            payload: formatError(err),
          })
        );
    } else {
      setTimeout(() => {
        // Bounce to home page
        navigate('/');
      }, 3000);
    }
  }, [dispatch, user]);

  // Handlers
  const handleOfficeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const officeSelected = event.target.value as string;
    setSelectedOffice(officeSelected);
    const currentOffice = state.offices.find((o) => o.name === officeSelected);
    setOfficeSlots(currentOffice?.slots);
  };

  const handleBookingDateChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const bookingDateSlotSelected = event.target.value as string;
    setSelectedBookingDate(bookingDateSlotSelected);
  };

  if (!user) {
    return null;
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    navigate(`/admin`);
  };

  const handleCloseValidationError = () => {
    setShowValidationError(false);
  };

  const emailIsValid = validateEmail(state.config?.emailRegex, email);

  const handleValidationErrorMessage = () => {
    if (!emailIsValid) {
      return 'Email address not permitted';
    } else if (!selectedOffice) {
      return 'No Office Selected, Please Select an Office';
    } else if (!selectedBookingDate) {
      return 'No Booking Date Selected, Please Select a Booking Date';
    } else if (parking === undefined) {
      return 'Please specify if parking is required';
    }
    return;
  };

  const handleCreateBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    if (emailIsValid && selectedOffice && selectedBookingDate && parking !== undefined) {
      // Create new booking
      await createBooking(email, selectedBookingDate, selectedOffice, parking)
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
              office: selectedOffice,
              date: selectedBookingDate,
            },
          });
          setShowSuccess(true);
        })
        .catch((err) =>
          dispatch({
            type: 'SET_ERROR',
            payload: formatError(err),
          })
        );
      setLoading(false);
    } else {
      setShowValidationError(true);
      setLoading(false);
    }
  };

  return (
    <Layout>
      <AdminHeader currentRoute={'home'} />

      <AdminCreateBookingStyles>
        {user.permissions.officesCanManageBookingsFor.length === 0 ? (
          <div className="redirect">
            <h2>Only for admins</h2>
            <p>You don&apos;t have an access to view this page, redirecting you to home...</p>
          </div>
        ) : loading ? (
          <Loading />
        ) : (
          <>
            <h1>Create a New Booking</h1>
            <h2 className="form-label">Office</h2>
            <section className="select-container">
              <FormControl variant="outlined">
                <InputLabel id="demo-simple-select-outlined-label">Select</InputLabel>
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
              <form onSubmit={handleCreateBooking}>
                <h2 className="form-label">Booking Date</h2>
                <FormControl variant="outlined">
                  <InputLabel id="demo-simple-select-outlined-label">Select Date</InputLabel>
                  <Select
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    value={selectedBookingDate}
                    onChange={handleBookingDateChange}
                    label="Booking Date"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {officeSlots &&
                      officeSlots.map((data, index) => (
                        <MenuItem value={data.date} key={index}>
                          {data.date}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <h2 className="form-label">Booking For</h2>
                <TextField
                  label="Email Address"
                  type="email"
                  color="primary"
                  fullWidth
                  onChange={(e) => setEmail(e.target.value)}
                />

                <h2 className="form-label">Parking</h2>
                <FormControl component="fieldset">
                  <RadioGroup
                    aria-label="parking"
                    name="parking"
                    value={parking?.toString() ?? ''}
                    onChange={(e) => {
                      setParking(
                        e.currentTarget.value === 'true'
                          ? true
                          : e.currentTarget.value === 'false'
                          ? false
                          : undefined
                      );
                    }}
                  >
                    <FormControlLabel value="true" control={<Radio />} label="With Parking" />
                    <FormControlLabel value="false" control={<Radio />} label="Without Parking" />
                  </RadioGroup>
                </FormControl>

                <div className="btn-container">
                  <OurButton type="submit" variant="contained" color="primary">
                    Submit New Booking
                  </OurButton>
                </div>
              </form>

              <Snackbar open={showSuccess} autoHideDuration={2000} onClose={handleCloseSuccess}>
                <Alert onClose={handleCloseSuccess} severity="success">
                  Booking created for {email}!
                </Alert>
              </Snackbar>
              <Snackbar open={showValidationError} onClose={handleCloseValidationError}>
                <Alert onClose={handleCloseValidationError} severity="error">
                  {handleValidationErrorMessage()}
                </Alert>
              </Snackbar>
            </section>
          </>
        )}
      </AdminCreateBookingStyles>
    </Layout>
  );
};

export default AdminCreateBooking;
