import React, { useContext, useState, useEffect } from 'react';
import { RouteComponentProps } from '@reach/router';
import Paper from '@material-ui/core/Paper';

import { AppContext } from '../../AppProvider';

import AdminLayout from './Layout/Layout';
import Loading from '../../Assets/LoadingSpinner';

import { getOffices, getStats } from '../../../lib/api';
import { formatError } from '../../../lib/app';
import { Office, OfficeDateStats } from '../../../types/api';

import CreateBookingStyles from './CreateBooking.styles';
import TableHead from '@material-ui/core/TableHead/TableHead';
import TableRow from '@material-ui/core/TableRow/TableRow';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import format from 'date-fns/format';

const BookingStats: React.FC<RouteComponentProps> = () => {
  // Global state
  const { state, dispatch } = useContext(AppContext);
  const { user } = state;

  // Local state
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<
    | {
        offices: Office[];
        dates: string[];
        officeDateStats: Map<string, OfficeDateStats>;
      }
    | undefined
  >();

  const statKey = (stat: Pick<OfficeDateStats, 'officeId' | 'date'>) => stat.officeId + stat.date;

  // Effects
  useEffect(() => {
    if (user) {
      // Get all offices user can manage
      Promise.all([getOffices(), getStats()])
        .then(([offices, stats]) => {
          setStats({
            offices,
            dates: Array.from(new Set(stats?.officeDates.map((d) => d.date))),
            officeDateStats: new Map(stats.officeDates.map((stat) => [statKey(stat), stat])),
          });
          setLoading(false);
        })
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
  }, [dispatch, user]);

  // Render
  if (!user) {
    return null;
  }

  return (
    <AdminLayout currentRoute="stats">
      <CreateBookingStyles>
        {loading || !stats ? (
          <Loading />
        ) : (
          <>
            <h3>Daily Office Booking Counts</h3>
            <Paper square className="form-container">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Office</TableCell>
                      {stats.dates.map((date) => (
                        <TableCell key={date}>{format(new Date(date), 'do MMM')}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.offices.map((office) => (
                      <TableRow key={office.id}>
                        <TableCell>{office.name}</TableCell>
                        {stats.dates.map((date) => {
                          const statsRow = stats.officeDateStats.get(
                            statKey({ officeId: office.id, date })
                          );

                          return (
                            <TableCell key={date}>
                              <span title="Bookings">{statsRow?.bookingCount}</span>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </CreateBookingStyles>
    </AdminLayout>
  );
};

export default BookingStats;
