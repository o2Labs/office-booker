import { AppState, Config } from './stores';
import { User, Office, Booking, OfficeSlot } from '../types/api';
import { Color } from '@material-ui/lab/Alert';

// Types
type OfficeSlotPayload = {
  office: Office['name'];
  date: string;
};

type ActionSetConfig = { type: 'SET_CONFIG'; payload: Config };
type ActionSetUser = { type: 'SET_USER'; payload: User | undefined };
type ActionSetOffices = { type: 'SET_OFFICES'; payload: Office[] };
type ActionSetCurrentOffice = { type: 'SET_CURRENT_OFFICE'; payload: Office | undefined };
type ActionSetBookings = { type: 'SET_BOOKINGS'; payload: Booking[] };
type ActionAddBookings = { type: 'ADD_BOOKING'; payload: Booking };
type ActionRemoveBookings = { type: 'REMOVE_BOOKING'; payload: Booking['id'] };
type ActionIncreaseOfficeSlot = { type: 'INCREASE_OFFICE_SLOT'; payload: OfficeSlotPayload };
type ActionDecreaseOfficeSlot = { type: 'DECREASE_OFFICE_SLOT'; payload: OfficeSlotPayload };
type ActionSetError = { type: 'SET_ERROR'; payload: string | undefined; color?: Color };
type ActionSetAlert = {
  type: 'SET_ALERT';
  payload: { message: string; color: Color } | undefined;
};

export type AppAction =
  | ActionSetConfig
  | ActionSetUser
  | ActionSetOffices
  | ActionSetCurrentOffice
  | ActionSetBookings
  | ActionAddBookings
  | ActionRemoveBookings
  | ActionIncreaseOfficeSlot
  | ActionDecreaseOfficeSlot
  | ActionSetError
  | ActionSetAlert;

// Helpers
const updateSlots = (
  allOffices: Office[],
  office: Office['name'],
  date: OfficeSlot['date'],
  action: 'increase' | 'decrease'
) =>
  allOffices.map((o) => {
    if (o.name !== office) {
      return o;
    }

    const slots = o.slots.map((s) => {
      if (s.date !== date) {
        return s;
      }

      // Update counter
      return {
        ...s,
        booked:
          action === 'increase'
            ? (s.booked += 1)
            : action === 'decrease'
            ? (s.booked -= 1)
            : s.booked,
      };
    });

    return {
      ...o,
      slots,
    };
  });

// Reducers
export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_OFFICES':
      return { ...state, offices: [...action.payload] };
    case 'SET_CURRENT_OFFICE':
      return { ...state, currentOffice: action.payload };
    case 'SET_BOOKINGS':
      return { ...state, bookings: [...action.payload] };
    case 'ADD_BOOKING': {
      const bookings = [action.payload];

      if (state.bookings) {
        bookings.push(...state.bookings);
      }

      return {
        ...state,
        bookings,
      };
    }
    case 'REMOVE_BOOKING': {
      const bookings = [];

      if (state.bookings) {
        bookings.push(...state.bookings.filter((b) => b.id !== action.payload));
      }

      return {
        ...state,
        bookings,
      };
    }
    case 'INCREASE_OFFICE_SLOT': {
      const { date, office } = action.payload;

      return {
        ...state,
        offices: updateSlots(state.offices, office, date, 'increase'),
      };
    }
    case 'DECREASE_OFFICE_SLOT': {
      const { date, office } = action.payload;

      return {
        ...state,
        offices: updateSlots(state.offices, office, date, 'decrease'),
      };
    }
    case 'SET_ERROR':
      if (action.payload) {
        return { ...state, error: { message: action.payload, color: 'error' } };
      }
      return { ...state, error: undefined };
    case 'SET_ALERT':
      if (action.payload) {
        return { ...state, error: action.payload };
      }
      return { ...state, error: undefined };
    default:
      return state;
  }
};
