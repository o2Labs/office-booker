import { Arrays } from 'collection-fns';
import { format, addDays, startOfWeek, parse, subMinutes } from 'date-fns';
import { Config } from './app-config';

export const getVisibleDates = (
  config: Pick<Config, 'advanceBookingDays' | 'dataRetentionDays'>
) => {
  const today = new Date();
  const start = addDays(today, -1 * config.dataRetentionDays);
  return Arrays.init({ count: config.advanceBookingDays + config.dataRetentionDays }, (i) =>
    format(addDays(start, i), 'yyyy-MM-dd')
  );
};

export const getAvailableDates = (config: Pick<Config, 'advanceBookingDays'>) => {
  const today = new Date();
  return Arrays.init({ count: config.advanceBookingDays }, (i) =>
    format(addDays(today, i), 'yyyy-MM-dd')
  );
};

export const dateStartOfWeek = (date: string) => {
  const start = startOfWeek(parse(date, 'yyyy-MM-dd', new Date()), { weekStartsOn: 1 });
  const adjustedToUTC = subMinutes(start, start.getTimezoneOffset());
  return format(adjustedToUTC, 'yyyy-MM-dd');
};
