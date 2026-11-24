'use client';

import type {
    CalendarEventForm,
    CalendarEventFormInput,
} from '@cocooning/couple-client-business-logic/agenda';
import { Button, FieldError, Input, Switch } from '@cocooning/design-system';
import { X } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';
import { SettingsRow } from './settings-row';

type Props = {
    readonly form: UseFormReturn<
        CalendarEventFormInput,
        unknown,
        CalendarEventForm
    >;
    readonly isAllDay: boolean;
    readonly onAllDayChange: (allDay: boolean) => void;
};

const MOMENT_FIELDS = ['startsOn', 'startsAt', 'endsAt', 'endsOn'] as const;
type MomentField = (typeof MOMENT_FIELDS)[number];

const errorIdOf = (field: MomentField) => `calendar-event-${field}-error`;

// Native inputs open the pickers of the phone; text-base keeps Safari from zooming (decision 0047: YYYY-MM-DD, HH:MM).
const NATIVE_INPUT =
    'h-10 w-auto min-w-0 border-0 bg-transparent px-0 text-right aria-invalid:text-destructive';

// R5: a day, then optional hours and an optional last day, grouped like the phone settings.
export function CalendarEventMomentFields({
    form,
    isAllDay,
    onAllDayChange,
}: Props) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    const { errors } = form.formState;
    const nativeInput = (field: MomentField, type: 'date' | 'time') => (
        <Input
            id={field}
            type={type}
            className={NATIVE_INPUT}
            aria-invalid={Boolean(errors[field])}
            aria-describedby={errorIdOf(field)}
            {...form.register(field)}
        />
    );
    const clearEndsOn = () =>
        form.setValue('endsOn', '', {
            shouldDirty: true,
            shouldValidate: form.formState.isSubmitted,
        });
    return (
        <div className="flex flex-col gap-2">
            <div className="divide-y divide-border rounded-xl border border-border bg-background">
                <SettingsRow
                    label={t('form.moment.day')}
                    htmlFor="startsOn"
                >
                    {nativeInput('startsOn', 'date')}
                </SettingsRow>
                <SettingsRow
                    label={t('form.moment.allDay')}
                    htmlFor="allDay"
                >
                    <Switch
                        id="allDay"
                        checked={isAllDay}
                        onCheckedChange={onAllDayChange}
                    />
                </SettingsRow>
                {isAllDay ? null : (
                    <>
                        <SettingsRow
                            label={t('form.moment.startsAt')}
                            htmlFor="startsAt"
                        >
                            {nativeInput('startsAt', 'time')}
                        </SettingsRow>
                        <SettingsRow
                            label={t('form.moment.endsAt')}
                            htmlFor="endsAt"
                        >
                            {nativeInput('endsAt', 'time')}
                        </SettingsRow>
                    </>
                )}
                <SettingsRow
                    label={t('form.moment.endsOn')}
                    htmlFor="endsOn"
                >
                    <div className="flex items-center">
                        {nativeInput('endsOn', 'date')}
                        {form.watch('endsOn') === '' ? null : (
                            <Button
                                variant="ghost"
                                className="size-11 px-0 text-muted-foreground"
                                aria-label={t('form.moment.clearEndsOn')}
                                onClick={clearEndsOn}
                            >
                                <X aria-hidden />
                            </Button>
                        )}
                    </div>
                </SettingsRow>
            </div>
            {MOMENT_FIELDS.map((field) => (
                <FieldError
                    key={field}
                    id={errorIdOf(field)}
                >
                    {errors[field]?.message}
                </FieldError>
            ))}
        </div>
    );
}
