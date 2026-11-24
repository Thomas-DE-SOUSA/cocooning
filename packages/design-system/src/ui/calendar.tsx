'use client';

import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ComponentProps } from 'react';
import { type ChevronProps, DayPicker, defaultDateLib } from 'react-day-picker';
import { cn } from '../utils/cn';
import { CalendarDayButton } from './calendar-day-button';

export type CalendarProps = ComponentProps<typeof DayPicker>;

const NAVIGATION_BUTTON =
    'inline-flex size-11 items-center justify-center rounded-full text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring aria-disabled:opacity-50';

const CHEVRONS = {
    left: ChevronLeft,
    right: ChevronRight,
    up: ChevronDown,
    down: ChevronDown,
} as const;

function CalendarChevron({ className, orientation = 'down' }: ChevronProps) {
    const Icon = CHEVRONS[orientation];
    return (
        <Icon
            aria-hidden="true"
            className={cn('size-5', className)}
        />
    );
}

// The month grid of react-day-picker in the tokens of the theme; labels and locale arrive as props.
export function Calendar({
    className,
    classNames,
    components,
    formatters,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            data-slot="calendar"
            showOutsideDays={showOutsideDays}
            className={cn('w-full', className)}
            classNames={{
                months: 'relative flex flex-col',
                month: 'flex w-full flex-col gap-2',
                nav: 'absolute inset-x-0 top-0 z-10 flex items-center justify-between',
                button_previous: NAVIGATION_BUTTON,
                button_next: NAVIGATION_BUTTON,
                month_caption: 'flex h-11 items-center justify-center px-12',
                caption_label:
                    'inline-flex items-center gap-1 font-display text-lg font-semibold first-letter:uppercase',
                dropdowns: 'flex items-center gap-2',
                dropdown_root:
                    'relative inline-flex items-center rounded-lg has-focus-visible:outline-2 has-focus-visible:outline-ring',
                dropdown: 'absolute inset-0 cursor-pointer opacity-0',
                month_grid: 'w-full border-collapse',
                weekdays: 'flex',
                weekday:
                    'flex-1 py-1 text-xs font-medium text-muted-foreground select-none',
                week: 'flex w-full',
                day: 'flex-1 p-0 text-center',
                hidden: 'invisible',
                ...classNames,
            }}
            formatters={{
                formatWeekdayName: (
                    weekday,
                    _options,
                    dateLib = defaultDateLib,
                ) => dateLib.format(weekday, 'ccccc'),
                ...formatters,
            }}
            components={{
                Chevron: CalendarChevron,
                DayButton: CalendarDayButton,
                ...components,
            }}
            {...props}
        />
    );
}
