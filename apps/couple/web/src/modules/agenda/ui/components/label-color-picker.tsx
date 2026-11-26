'use client';

import type { CalendarLabelForm } from '@cocooning/couple-client-business-logic/agenda';
import { CalendarLabelColorEnum } from '@cocooning/couple-shared-kernel/enums';
import { cn, FieldError } from '@cocooning/design-system';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CALENDAR_LABELS_NAMESPACE } from '../../data/calendar-labels-i18n-namespace';
import { TINT_FILL } from './event-tint-classes';

const PALETTE = Object.values(CalendarLabelColorEnum);
const LEGEND_ID = 'calendar-label-color-legend';
const ERROR_ID = 'calendar-label-color-error';

// R12: eight round swatches of 56 px, named for screen readers; the chosen one has a ring.
export function LabelColorPicker({
    form,
}: {
    readonly form: UseFormReturn<CalendarLabelForm>;
}) {
    const { t } = useTranslation(CALENDAR_LABELS_NAMESPACE);
    return (
        <fieldset className="flex flex-col gap-2">
            <legend
                id={LEGEND_ID}
                className="pb-2 text-sm font-medium"
            >
                {t('form.labelColor.label')}
            </legend>
            <Controller
                control={form.control}
                name="color"
                render={({ field }) => (
                    <div
                        role="radiogroup"
                        aria-labelledby={LEGEND_ID}
                        aria-describedby={ERROR_ID}
                        className="grid grid-cols-[repeat(4,3.5rem)] justify-between gap-y-3.5"
                    >
                        {PALETTE.map((color) => {
                            const isChecked = field.value === color;
                            return (
                                <button
                                    key={color}
                                    type="button"
                                    role="radio"
                                    aria-checked={isChecked}
                                    aria-label={t(`colors.${color}`)}
                                    onClick={() => field.onChange(color)}
                                    className={cn(
                                        'size-14 rounded-full ring-offset-3 ring-offset-card focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-ring',
                                        TINT_FILL[color],
                                        isChecked
                                            ? 'ring-3 ring-foreground'
                                            : null,
                                    )}
                                />
                            );
                        })}
                    </div>
                )}
            />
            <FieldError id={ERROR_ID}>
                {form.formState.errors.color?.message}
            </FieldError>
        </fieldset>
    );
}
