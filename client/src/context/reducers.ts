import { AppState, Config, Alert } from './stores';
import { User } from '../types/api';

// Types
type ActionSetConfig = { type: 'SET_CONFIG'; payload: Config };
type ActionSetUser = { type: 'SET_USER'; payload: User | undefined };
type ActionSetAlert = { type: 'SET_ALERT'; payload: Alert | undefined };

export type AppAction = ActionSetConfig | ActionSetUser | ActionSetAlert;

// Reducers
export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_ALERT':
      return { ...state, alert: action.payload };
    default:
      return state;
  }
};
