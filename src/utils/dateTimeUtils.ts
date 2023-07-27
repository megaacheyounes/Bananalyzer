import { parse } from 'path';

export const isValidDate = (date: string | undefined) => {
  if (!date) return false;
  const parsed = Date.parse(date);
  const dateObj: any = new Date(date);

  return !Number.isNaN(parsed) && dateObj !== 'Invalid Date' && !Number.isNaN(dateObj);
};
