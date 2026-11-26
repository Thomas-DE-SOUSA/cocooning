import type { CalendarLabelForm } from '@cocooning/couple-client-business-logic/agenda';
import { CalendarLabelColorEnum } from '@cocooning/couple-shared-kernel/enums';
import type { CalendarLabelItem } from '../view-models/calendar-label.view-model';

const PALETTE = Object.values(CalendarLabelColorEnum);

// R12: a new label starts on the first colour the couple does not use yet, the first of the palette when all are taken.
export function presentNewCalendarLabel(
    labels: readonly CalendarLabelItem[],
): CalendarLabelForm {
    const used = new Set(labels.map(({ color }) => color));
    const [firstFree = CalendarLabelColorEnum.SAGE] = PALETTE.filter(
        (color) => !used.has(color),
    );
    return { name: '', color: firstFree };
}

export const presentCalendarLabelOf = ({
    name,
    color,
}: CalendarLabelItem): CalendarLabelForm => ({ name, color });
