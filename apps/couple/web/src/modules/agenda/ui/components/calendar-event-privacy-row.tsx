'use client';

import type {
    CalendarEventForm,
    CalendarEventFormInput,
} from '@cocooning/couple-client-business-logic/agenda';
import { Label, Switch } from '@cocooning/design-system';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';

type Props = {
    readonly form: UseFormReturn<
        CalendarEventFormInput,
        unknown,
        CalendarEventForm
    >;
};

const HINT_ID = 'calendar-event-private-hint';

// R3 at creation, R8 when the author edits: the other partner never sees this row.
export function CalendarEventPrivacyRow({ form }: Props) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    return (
        <div className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
            <div className="flex flex-col gap-0.5">
                <Label
                    htmlFor="isPrivate"
                    className="text-base font-normal"
                >
                    {t('form.isPrivate.label')}
                </Label>
                <p
                    id={HINT_ID}
                    className="text-sm text-muted-foreground"
                >
                    {t('form.isPrivate.hint')}
                </p>
            </div>
            <Controller
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                    <Switch
                        id="isPrivate"
                        aria-describedby={HINT_ID}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        onBlur={field.onBlur}
                    />
                )}
            />
        </div>
    );
}
