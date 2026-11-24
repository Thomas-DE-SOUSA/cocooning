const pad = (value: number): string => String(value).padStart(2, '0');

// react-day-picker draws local dates: a day built part by part is the same on the server (UTC) and on the phone (Paris).
export const toLocalDate = (day: string): Date =>
    new Date(
        Number(day.slice(0, 4)),
        Number(day.slice(5, 7)) - 1,
        Number(day.slice(8, 10)),
    );

export const fromLocalDate = (date: Date): string =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
