import React from 'react';
import { Router } from '@reach/router';

import RequireLogin from './Auth/RequireLogin';
import PageNotFound from './App/PageNotFound';
import Home from './App/Home';
import ViewBooking from './App/ViewBooking';
import Help from './App/Help';
import Bookings from './App/Admin/Bookings';
import Users from './App/Admin/Users';
import User from './App/Admin/User';
import UserBookings from './App/Admin/UserBookings';
import CreateBooking from './App/Admin/CreateBooking';
import UpcomingBookings from './App/UpcomingBookings';
import Privacy from './App/Privacy';

const Routes: React.FC = () => {
  // Render
  return (
    <Router>
      <RequireLogin path="/">
        <Home path="/" />
        <ViewBooking path="/booking/:id" />
        <UpcomingBookings path="/bookings" />

        <Bookings path="/admin" />
        <CreateBooking path="/admin/booking" />
        <Users path="/admin/users" />
        <User path="/admin/users/:email" />
        <UserBookings path="/admin/users/bookings/:email" />

        <Privacy path="/privacy" />
        <PageNotFound default={true} />
      </RequireLogin>

      <Help path="/help" />
    </Router>
  );
};

export default Routes;
