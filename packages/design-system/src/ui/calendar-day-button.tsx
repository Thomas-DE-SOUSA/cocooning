'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import type { DayButtonProps, Modifiers } from 'react-day-picker';
import { cn } from '../utils/cn';

type Props = DayButtonProps & {
    readonly marks?: ReactNode;
};

function dayNumberClass(modifiers: Modifiers): string {
    if (modifiers['selected']) {
        return 'bg-primary font-semibold text-primary-foreground';
    }
    if (modifiers['today']) return 'font-bold text-primary';
    if (modifiers['outside']) return 'text-muted-foreground';
    return '';
}

// A day of the calendar: its number in a circle, filled when selected, and the marks the app draws below.
export function CalendarDayButton({
    day,
    modifiers,
    className,
    children,
    marks,
    ...props
}: Props) {
    const ref = useRef<HTMLButtonElement>(null);
    const isFocused = modifiers['focused'];
    useEffect(() => {
        if (isFocused) ref.current?.focus();
    }, [isFocused]);
    return (
        <button
            ref={ref}
            data-slot="calendar-day-button"
            data-day={day.isoDate}
            className={cn(
                'flex h-12 w-full flex-col items-center justify-start gap-1 rounded-lg pt-1 focus-visible:outline-2 focus-visible:outline-ring',
                className,
            )}
            {...props}
        >
            <span
                className={cn(
                    'flex size-8 items-center justify-center rounded-full text-sm',
                    dayNumberClass(modifiers),
                )}
            >
                {children}
            </span>
            {marks}
        </button>
    );
}
