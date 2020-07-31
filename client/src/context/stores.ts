import { Dispatch } from 'react';
import { Color } from '@material-ui/lab/Alert';

import { AppAction } from './reducers';

import { User } from '../types/api';

// Types
export type Alert = {
  message: string;
  color: Color;
};

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
  user?: User;
  alert?: Alert;
};
