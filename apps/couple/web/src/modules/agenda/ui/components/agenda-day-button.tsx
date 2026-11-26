'use client';

import { CalendarDayButton } from '@cocooning/design-system';
import { use } from 'react';
import type { DayButtonProps } from 'react-day-picker';
import type { DayMark } from '../../view-models/agenda-screen.view-model';
import { DayMarksContext } from './day-marks-context';
import { EventDot } from './event-dot';

const NO_MARKS: readonly DayMark[] = [];

// A day of the grid with up to three dots, one per event of that day, in the colour of its label (R13).
export function AgendaDayButton(props: DayButtonProps) {
    const marks = use(DayMarksContext)[props.day.isoDate] ?? NO_MARKS;
    return (
        <CalendarDayButton
            {...props}
            marks={
                <span
                    data-slot="day-marks"
                    className="flex h-1.5 items-center gap-0.5"
                >
                    {marks.map((mark) => (
                        <EventDot
                            key={mark.calendarEventId}
                            tint={mark.tint}
                            isPrivate={mark.isPrivate}
                            className="size-1.5"
                        />
                    ))}
                </span>
            }
        />
    );
}
