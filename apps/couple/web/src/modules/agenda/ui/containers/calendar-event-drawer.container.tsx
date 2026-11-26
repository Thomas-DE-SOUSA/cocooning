'use client';

import { Drawer } from '@cocooning/design-system';
import type { CalendarLabelItem } from '../../view-models/calendar-label.view-model';
import type { CalendarEventDrawerTarget } from '../../view-models/calendar-event-drawer.view-model';
import { CalendarEventSheetContainer } from './calendar-event-sheet.container';

type Props = {
    readonly target: CalendarEventDrawerTarget | null;
    readonly isOpen: boolean;
    readonly opening: number;
    readonly labels: readonly CalendarLabelItem[];
    readonly onClose: () => void;
};

// The sheet keeps its target while it slides down; keyed by the opening, a new opening starts from a fresh form.
export function CalendarEventDrawerContainer({
    target,
    isOpen,
    opening,
    labels,
    onClose,
}: Props) {
    return (
        <Drawer
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            {target === null ? null : (
                <CalendarEventSheetContainer
                    key={opening}
                    target={target}
                    labels={labels}
                    onClose={onClose}
                />
            )}
        </Drawer>
    );
}
