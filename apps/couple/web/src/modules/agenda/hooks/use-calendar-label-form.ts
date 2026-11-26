import {
    type CalendarLabelForm,
    createCalendarLabelFormSchema,
} from '@cocooning/couple-client-business-logic/agenda';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CALENDAR_LABELS_NAMESPACE } from '../data/calendar-labels-i18n-namespace';

// R12: the name and the colour of a label, with the messages of the label sheet (decision 0031).
export function useCalendarLabelForm(
    initial: CalendarLabelForm,
): UseFormReturn<CalendarLabelForm> {
    const { t } = useTranslation(CALENDAR_LABELS_NAMESPACE);
    const schema = useMemo(() => createCalendarLabelFormSchema(t), [t]);
    return useForm<CalendarLabelForm>({
        resolver: zodResolver(schema),
        defaultValues: initial,
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    });
}
