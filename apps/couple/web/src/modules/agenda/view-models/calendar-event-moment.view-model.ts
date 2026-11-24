// The moment as the API stores it, whatever the day shown: the drawer edits this one (decision 0047).
export type CalendarEventMoment = {
    readonly startsOn: string;
    readonly endsOn: string | null;
    readonly startsAt: string | null;
    readonly endsAt: string | null;
};
