'use client';

import { DrawerNested } from '@cocooning/design-system';
import type { CalendarLabelItem } from '../../view-models/calendar-label.view-model';
import {
    type CalendarLabelCommand,
    CalendarLabelSheetModeEnum,
} from '../../view-models/calendar-label-command.view-model';
import { CalendarLabelSheetContainer } from './calendar-label-sheet.container';

type Props = {
    readonly isOpen: boolean;
    readonly opening: number;
    readonly labels: readonly CalendarLabelItem[];
    readonly onClose: () => void;
    readonly onDone: (
        command: CalendarLabelCommand,
        label: CalendarLabelItem | null,
    ) => void;
};

// Decision 0057: a nested sheet above the event sheet, which keeps its form; each opening starts afresh.
export function NewCalendarLabelDrawerContainer({
    isOpen,
    opening,
    labels,
    onClose,
    onDone,
}: Props) {
    return (
        <DrawerNested
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            {opening === 0 ? null : (
                <CalendarLabelSheetContainer
                    key={opening}
                    target={{ mode: CalendarLabelSheetModeEnum.CREATE, labels }}
                    onClose={onClose}
                    onDone={onDone}
                    onStale={onClose}
                />
            )}
        </DrawerNested>
    );
}
