import { AppState, Config, Alert } from './stores';
import { User } from '../types/api';

// Types
type ActionSetConfig = { type: 'SET_CONFIG'; payload: Config };
type ActionSetUser = { type: 'SET_USER'; payload: User | undefined };
type ActionSetOffice = { type: 'SET_OFFICE'; payload: { id: string } | undefined };
type ActionSetAlert = { type: 'SET_ALERT'; payload: Alert | undefined };

export type AppAction = ActionSetConfig | ActionSetUser | ActionSetOffice | ActionSetAlert;

// Reducers
export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_OFFICE':
      // Update local storage
      if (action.payload) {
        localStorage.setItem('officeId', action.payload.id);
      } else {
        localStorage.removeItem('officeId');
      }
      localStorage.removeItem('office');

      return { ...state, office: action.payload ? { id: action.payload.id } : undefined };
    case 'SET_ALERT':
      return { ...state, alert: action.payload };
    default:
      return state;
  }
};
