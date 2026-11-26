import type { CalendarLabelListResponse } from '@cocooning/couple-contract/agenda';
import type { CalendarLabelItem } from '../view-models/calendar-label.view-model';

export type CalendarLabelIndex = ReadonlyMap<string, CalendarLabelItem>;

// R12: the labels of the couple in creation order, as the API lists them.
export const presentCalendarLabels = (
    list: CalendarLabelListResponse,
): CalendarLabelItem[] =>
    list.items.map(({ calendarLabelId, name, color }) => ({
        calendarLabelId,
        name,
        color,
    }));

export const indexCalendarLabels = (
    labels: readonly CalendarLabelItem[],
): CalendarLabelIndex =>
    new Map(labels.map((label) => [label.calendarLabelId, label]));
