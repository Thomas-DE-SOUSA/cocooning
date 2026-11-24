import {
    type CalendarEventForm,
    type CalendarEventFormInput,
    createCalendarEventFormSchema,
} from '@cocooning/couple-client-business-logic/agenda';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AGENDA_NAMESPACE } from '../data/agenda-i18n-namespaces';
import { toCalendarEventFormInput } from '../presenters/calendar-event-form.presenter';

// R5: an event without a start hour lasts all day; turning "Toute la journée" on clears both hours.
export function useCalendarEventForm(initial: CalendarEventForm) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    const schema = useMemo(() => createCalendarEventFormSchema(t), [t]);
    const form = useForm<CalendarEventFormInput, unknown, CalendarEventForm>({
        resolver: zodResolver(schema),
        defaultValues: toCalendarEventFormInput(initial),
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    });
    const [isAllDay, setIsAllDay] = useState(initial.startsAt === null);
    const changeAllDay = useCallback(
        (allDay: boolean) => {
            setIsAllDay(allDay);
            if (!allDay) return;
            form.setValue('startsAt', '');
            form.setValue('endsAt', '');
        },
        [form],
    );
    return { form, isAllDay, changeAllDay };
}
