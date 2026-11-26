'use client';

import type {
    CalendarEventForm,
    CalendarEventFormInput,
} from '@cocooning/couple-client-business-logic/agenda';
import {
    Field,
    FieldError,
    Input,
    Label,
    Textarea,
} from '@cocooning/design-system';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';
import type { CalendarLabelItem } from '../../view-models/calendar-label.view-model';
import { AudiencePicker } from '../components/audience-picker';
import { CalendarEventMomentFields } from '../components/calendar-event-moment-fields';
import { CalendarEventPrivacyRow } from '../components/calendar-event-privacy-row';
import { CalendarLabelChips } from '../components/calendar-label-chips';

type Props = {
    readonly formId: string;
    readonly form: UseFormReturn<
        CalendarEventFormInput,
        unknown,
        CalendarEventForm
    >;
    readonly isAllDay: boolean;
    readonly isEdition: boolean;
    readonly showsPrivacy: boolean;
    readonly labels: readonly CalendarLabelItem[];
    readonly onNewLabel: () => void;
    readonly onAllDayChange: (allDay: boolean) => void;
    readonly onSubmit: (form: CalendarEventForm) => void;
};

const TITLE_ERROR_ID = 'calendar-event-title-error';
const DESCRIPTION_ERROR_ID = 'calendar-event-description-error';

// The form of the drawer (R2, R5, R6, R11, R13); its submit button sits in the top row of the sheet, linked by formId.
export function CalendarEventFormView({
    formId,
    form,
    isAllDay,
    isEdition,
    showsPrivacy,
    labels,
    onNewLabel,
    onAllDayChange,
    onSubmit,
}: Props) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    const { errors } = form.formState;
    return (
        <form
            id={formId}
            method="post"
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
        >
            <Field>
                <Label htmlFor="title">{t('form.title.label')}</Label>
                <Input
                    id="title"
                    autoComplete="off"
                    enterKeyHint="done"
                    aria-invalid={Boolean(errors.title)}
                    aria-describedby={TITLE_ERROR_ID}
                    {...form.register('title')}
                />
                <FieldError id={TITLE_ERROR_ID}>
                    {errors.title?.message}
                </FieldError>
            </Field>
            <CalendarEventMomentFields
                form={form}
                isAllDay={isAllDay}
                onAllDayChange={onAllDayChange}
            />
            <AudiencePicker
                form={form}
                turnsPrivacyOff={!isEdition}
            />
            {showsPrivacy ? <CalendarEventPrivacyRow form={form} /> : null}
            <CalendarLabelChips
                form={form}
                labels={labels}
                onNewLabel={onNewLabel}
            />
            <Field>
                <Label htmlFor="description">
                    {t('form.description.label')}
                </Label>
                <Textarea
                    id="description"
                    rows={3}
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby={DESCRIPTION_ERROR_ID}
                    {...form.register('description')}
                />
                <FieldError id={DESCRIPTION_ERROR_ID}>
                    {errors.description?.message}
                </FieldError>
            </Field>
        </form>
    );
}
