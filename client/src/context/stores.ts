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
  autoApprovedEmails: string[];
  reasonToBookRequired: boolean;
};

export type AppState = {
  config?: Config;
  user?: User;
  office?: { name: string } | { id: string }; // TODO: Remove name option once we're happy most people have moved over to using the ID.
  alert?: Alert;
};

// Initial state
export const appInitialState: AppState = {
  office: (() => {
    const officeId = localStorage.getItem('officeId');
    if (officeId !== null) {
      return { id: officeId };
    }
    // TODO: Remove once we're happy most people have moved over to using the ID.
    const officeName = localStorage.getItem('office');
    if (officeName !== null) {
      return { name: officeName };
    }
    return undefined;
  })(),
};
