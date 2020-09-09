import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from '@reach/router';

import { AppContext } from '../AppProvider';

import Layout from '../Layout/Layout';
import Loading from '../Assets/LoadingSpinner';
import WhichOffice from './Home/WhichOffice';
import NextBooking from './Home/NextBooking';
import MakeBooking from './Home/MakeBooking';

import { getOffices, getBookings, getOffice } from '../../lib/api';
import { formatError } from '../../lib/app';
import { OfficeWithSlots, Booking, Office } from '../../types/api';

import HomeStyles from './Home.styles';
import CloseIcon from '@material-ui/icons/Close';
import { IconButton } from '@material-ui/core';

// Component
const Home: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user, office } = state;

  // Local state
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState(new Date());
  const [allOffices, setAllOffices] = useState<Office[] | undefined>();
  const [currentOffice, setCurrentOffice] = useState<OfficeWithSlots | undefined>();
  const [userBookings, setUserBookings] = useState<Booking[] | undefined>();
  const [openIEWarning, setIEWarningOpen] = React.useState(false);

  // Effects
  useEffect(() => {
    getOffices()
      .then(setAllOffices)
      .catch((err) => {
        dispatch({
          type: 'SET_ALERT',
          payload: {
            message: formatError(err),
            color: 'error',
          },
        });
      });
  }, [dispatch]);

  useEffect(() => {
    if (office === undefined) {
      setLoading(false);
    } else if ('id' in office) {
      getOffice(office.id)
        .then(setCurrentOffice)
        .catch((err) => {
          dispatch({
            type: 'SET_OFFICE',
            payload: undefined,
          });
        })
        .then(() => setLoading(false));
    }
  }, [office, refreshedAt, dispatch]);

  // TODO: Remove in a while once we're happy no-one's stored the old name version any more.
  useEffect(() => {
    if (office === undefined) {
      return;
    }
    if ('name' in office && allOffices) {
      const newOffice = allOffices.find((o) => o.name === office.name);
      dispatch({
        type: 'SET_OFFICE',
        payload: newOffice !== undefined ? { id: newOffice.id } : undefined,
      });
    }
  }, [office, allOffices, refreshedAt, dispatch]);

  useEffect(() => {
    if (user) {
      getBookings({ user: user.email })
        .then((data) => setUserBookings(data))
        .catch((err) => {
          dispatch({
            type: 'SET_ALERT',
            payload: {
              message: formatError(err),
              color: 'error',
            },
          });
        });
    }
  }, [user, refreshedAt, dispatch]);

  useEffect(() => {
    if (!office) {
      // Clear everything when the global office is cleared
      setCurrentOffice(undefined);
    }
  }, [office]);

  useEffect(() => {
    const browser = (() => {
      const test = (regexp: RegExp) => {
        return regexp.test(window.navigator.userAgent);
      };
      switch (true) {
        case test(/edg/i):
          return 'Microsoft Edge';
        case test(/trident/i):
          return 'Microsoft Internet Explorer';
        case test(/firefox|fxios/i):
          return 'Mozilla Firefox';
        case test(/opr\//i):
          return 'Opera';
        case test(/ucbrowser/i):
          return 'UC Browser';
        case test(/samsungbrowser/i):
          return 'Samsung Browser';
        case test(/chrome|chromium|crios/i):
          return 'Google Chrome';
        case test(/safari/i):
          return 'Apple Safari';
        default:
          return 'Other';
      }
    })();

     browser === 'Microsoft Internet Explorer' ? setIEWarningOpen(true) : setIEWarningOpen(false);

  }, []);

  // Handlers
  const handleRefreshBookings = () => {
    // Re-retrieve offices (and subsequently bookings) from the DB
    setRefreshedAt(new Date());
  };

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    setIEWarningOpen(false);
  };

  // Render
  return (
    <Layout>
      <HomeStyles>
        <div className={`ie-banner${openIEWarning ? ` ie-banner--open` : ``}`}>
          <div className="container">
            <IconButton
              className="ie-banner__close__a"
              onClick={handleClose}
              onKeyPress={handleClose}
              tabIndex={0}
            >
              <CloseIcon height={24} width={24} />
            </IconButton>
            <p className="ie-banner__p">
              Microsoft will end support for Internet Explorer in 2021. Consider upgrading to a <a href="https://browsehappy.com/"> modern browser</a> for an optimal experience.
            </p>
          </div>
        </div>
        {loading || !allOffices ? (
          <Loading />
        ) : currentOffice ? (
          userBookings && (
            <>
              <NextBooking bookings={userBookings} />
              <MakeBooking
                office={currentOffice}
                bookings={userBookings}
                refreshBookings={handleRefreshBookings}
              />
            </>
          )
        ) : (
          <WhichOffice offices={allOffices} />
        )}
      </HomeStyles>
    </Layout>
  );
};

export default Home;
