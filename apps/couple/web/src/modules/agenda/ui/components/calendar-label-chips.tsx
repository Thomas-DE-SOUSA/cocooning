'use client';

import type {
    CalendarEventForm,
    CalendarEventFormInput,
} from '@cocooning/couple-client-business-logic/agenda';
import { cn } from '@cocooning/design-system';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';
import type { CalendarLabelItem } from '../../view-models/calendar-label.view-model';
import { EventDot } from './event-dot';
import { TINT_BORDER } from './event-tint-classes';

type Props = {
    readonly form: UseFormReturn<
        CalendarEventFormInput,
        unknown,
        CalendarEventForm
    >;
    readonly labels: readonly CalendarLabelItem[];
    readonly onNewLabel: () => void;
};

const LEGEND_ID = 'calendar-event-label-legend';
const CHIP =
    'inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring';

// R13: one label or none; tapping the chosen chip again leaves the event without a label. "+ Nouvelle" opens the sheet of a new label (R12).
export function CalendarLabelChips({ form, labels, onNewLabel }: Props) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    return (
        <fieldset className="flex flex-col gap-2">
            <legend
                id={LEGEND_ID}
                className="pb-2 text-sm font-medium"
            >
                {t('form.label.legend')}{' '}
                <span className="font-normal text-muted-foreground">
                    {t('form.label.optional')}
                </span>
            </legend>
            <Controller
                control={form.control}
                name="labelId"
                render={({ field }) => (
                    <div
                        role="radiogroup"
                        aria-labelledby={LEGEND_ID}
                        className="flex flex-wrap gap-2"
                    >
                        {labels.map((label) => {
                            const isChecked =
                                field.value === label.calendarLabelId;
                            return (
                                <button
                                    key={label.calendarLabelId}
                                    type="button"
                                    role="radio"
                                    aria-checked={isChecked}
                                    onClick={() =>
                                        field.onChange(
                                            isChecked
                                                ? null
                                                : label.calendarLabelId,
                                        )
                                    }
                                    className={cn(
                                        CHIP,
                                        isChecked
                                            ? cn(
                                                  'border-2 bg-secondary font-bold',
                                                  TINT_BORDER[label.color],
                                              )
                                            : 'border border-border bg-background font-medium',
                                    )}
                                >
                                    <EventDot
                                        tint={label.color}
                                        isPrivate={false}
                                        className="size-2.5"
                                    />
                                    {label.name}
                                </button>
                            );
                        })}
                        <button
                            type="button"
                            onClick={onNewLabel}
                            className={cn(
                                CHIP,
                                'border border-dashed border-input font-semibold text-primary',
                            )}
                        >
                            {t('form.label.new')}
                        </button>
                    </div>
                )}
            />
        </fieldset>
    );
}
