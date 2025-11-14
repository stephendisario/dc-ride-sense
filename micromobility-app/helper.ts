export const parseDateString = (date: string) => {
    const year = date.slice(0, 4);
    const month = date.slice(5, 7);
    const day = date.slice(8, 10);

    return { year, month, day };
};

const EASTERN_OPTIONS: Intl.DateTimeFormatOptions = {
    timeZone: 'America/New_York',
    hour12: false,
};

export const formatEastern = (date: Date): string =>
    date.toLocaleString('sv-SE', EASTERN_OPTIONS).slice(0, 16).replace(' ', 'T');

export const setMinutesToZero = (timestamp: string): string => {
    const [datePart, timePart] = timestamp.split('T');
    if (!timePart) return timestamp;

    const [hh] = timePart.split(':');
    return `${datePart}T${hh}:00`;
};
