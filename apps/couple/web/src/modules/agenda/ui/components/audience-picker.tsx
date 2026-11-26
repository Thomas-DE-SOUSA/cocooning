'use client';

import {
    type CalendarEventForm,
    type CalendarEventFormInput,
    type ViewerAudience,
    ViewerAudienceEnum,
} from '@cocooning/couple-client-business-logic/agenda';
import { cn, FieldError } from '@cocooning/design-system';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';

type Props = {
    readonly form: UseFormReturn<
        CalendarEventFormInput,
        unknown,
        CalendarEventForm
    >;
    readonly turnsPrivacyOff: boolean;
};

const AUDIENCES = Object.values(ViewerAudienceEnum);
const LEGEND_ID = 'calendar-event-audience-legend';
const ERROR_ID = 'calendar-event-audience-error';

// R11: "Moi", "Toi" or "Nous deux" for the partner who fills the form. At creation, "Toi" or "Nous deux" turns
// "Rien que pour moi" off; an edit keeps the visibility to its own command (R8) and the form refuses the mismatch.
export function AudiencePicker({ form, turnsPrivacyOff }: Props) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    const error = form.formState.errors.audience?.message;
    const choose = (
        audience: ViewerAudience,
        onChange: (value: ViewerAudience) => void,
    ) => {
        onChange(audience);
        if (turnsPrivacyOff && audience !== ViewerAudienceEnum.ME) {
            form.setValue('isPrivate', false);
        }
    };
    return (
        <fieldset className="flex flex-col gap-2">
            <legend
                id={LEGEND_ID}
                className="pb-2 text-sm font-medium"
            >
                {t('form.audience.label')}
            </legend>
            <Controller
                control={form.control}
                name="audience"
                render={({ field }) => (
                    <div
                        role="radiogroup"
                        aria-labelledby={LEGEND_ID}
                        aria-describedby={ERROR_ID}
                        className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-background p-1"
                    >
                        {AUDIENCES.map((audience) => {
                            const isChecked = field.value === audience;
                            return (
                                <button
                                    key={audience}
                                    type="button"
                                    role="radio"
                                    aria-checked={isChecked}
                                    onClick={() =>
                                        choose(audience, field.onChange)
                                    }
                                    className={cn(
                                        'h-11 rounded-lg text-base focus-visible:outline-2 focus-visible:outline-ring',
                                        isChecked
                                            ? 'bg-primary font-bold text-primary-foreground'
                                            : 'font-medium',
                                    )}
                                >
                                    {t(`form.audience.options.${audience}`)}
                                </button>
                            );
                        })}
                    </div>
                )}
            />
            <FieldError id={ERROR_ID}>{error}</FieldError>
        </fieldset>
    );
}
