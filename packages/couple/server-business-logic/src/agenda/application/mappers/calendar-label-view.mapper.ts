import type { CalendarLabelColor } from '@cocooning/couple-shared-kernel/enums';
import type { CalendarLabel } from '../../domain/models/calendar-label.aggregate';

export type CalendarLabelView = {
    readonly calendarLabelId: string;
    readonly name: string;
    readonly color: CalendarLabelColor;
    readonly updatedAt: Date;
};

export const toCalendarLabelView = (
    label: CalendarLabel,
): CalendarLabelView => {
    const { id, name, color } = label.toSnapshot();
    return { calendarLabelId: id, name, color, updatedAt: label.updatedAt };
};

export const toCalendarLabelViews = (
    labels: ReadonlyArray<CalendarLabel>,
): ReadonlyArray<CalendarLabelView> => labels.map(toCalendarLabelView);
