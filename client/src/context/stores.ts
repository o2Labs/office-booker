import { Dispatch } from 'react';

import { AppAction } from './reducers';
import { User, Office, Booking } from '../types/api';
import { Color } from '@material-ui/lab/Alert';

// Types
export type AppStore = {
  state: AppState;
  dispatch: Dispatch<AppAction>;
};

export type Config = {
  showTestBanner: boolean;
  auth:
    | {
        type: 'cognito';
        region: string;
        userPoolId: string;
        webClientId: string;
      }
    | { type: 'test' };
  emailRegex?: string;
  advancedBookingDays: number;
};

export type AppState = {
  config?: Config;
  user: User | undefined;
  offices: Office[];
  currentOffice: Office | undefined;
  bookings: Booking[] | undefined;
  error?: { message: string; color: Color };
};

// State
export const initialAppState: AppState = {
  config: undefined,
  user: undefined,
  offices: [],
  currentOffice: undefined,
  bookings: undefined,
  error: undefined,
};
