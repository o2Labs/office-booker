import { getVisibleDates, getAvailableDates } from '../dates';

test('last available date is last visible date', () => {
  const config = { advanceBookingDays: 7, dataRetentionDays: 30 };
  const availableDates = getAvailableDates(config);
  const visibleDates = getVisibleDates(config);
  expect(availableDates[availableDates.length - 1]).toEqual(visibleDates[visibleDates.length - 1]);
});

test('without data retention', () => {
  const config = { advanceBookingDays: 7, dataRetentionDays: 0 };
  const availableDates = getAvailableDates(config);
  const visibleDates = getVisibleDates(config);
  expect(availableDates).toEqual(visibleDates);
});
