import React from 'react';
import { Router } from '@reach/router';
import Loadable from '@loadable/component';

import Loading from './Assets/LoadingSpinner';
import RequireLogin from './Auth/RequireLogin';
import PageNotFound from './App/PageNotFound';
import Home from './App/Home';
import UpcomingBookings from './App/UpcomingBookings';
import ViewBooking from './App/ViewBooking';
import Privacy from './App/Privacy';
import Help from './App/Help';
import Layout from './Layout/Layout';

const fallback = (
  <Layout>
    <Loading />
  </Layout>
);

const Bookings = Loadable(() => import('./App/Admin/Bookings'), { fallback });
const BookingStats = Loadable(() => import('./App/Admin/BookingStats'), { fallback });
const CreateBooking = Loadable(() => import('./App/Admin/CreateBooking'), { fallback });
const Users = Loadable(() => import('./App/Admin/Users'), { fallback });
const User = Loadable(() => import('./App/Admin/User'), { fallback });
const UserBookings = Loadable(() => import('./App/Admin/UserBookings'), { fallback });

const Routes: React.FC = () => {
  // Render
  return (
    <Router>
      <RequireLogin path="/">
        <Home path="/" />
        <ViewBooking path="/booking/:id" />
        <UpcomingBookings path="/bookings" />

        <Bookings path="/admin" />
        <BookingStats path="/admin/stats" />
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
