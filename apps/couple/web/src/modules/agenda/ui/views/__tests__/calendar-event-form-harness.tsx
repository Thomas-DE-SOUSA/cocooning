import type { CalendarEventForm } from '@cocooning/couple-client-business-logic/agenda';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithI18n } from '@/testing/with-i18n';
import { useCalendarEventForm } from '../../../hooks/use-calendar-event-form';
import { presentNewCalendarEvent } from '../../../presenters/calendar-event-form.presenter';
import type { CalendarLabelItem } from '../../../view-models/calendar-label.view-model';
import { CalendarEventFormView } from '../calendar-event-form.view';

const FORM_ID = 'calendar-event-form';
export const SPORT_ID = '01936b2e-7c4a-7000-8000-0000000000b1';
const LABELS: CalendarLabelItem[] = [
    { calendarLabelId: SPORT_ID, name: 'Sport', color: 'MINT' },
    {
        calendarLabelId: '01936b2e-7c4a-7000-8000-0000000000b2',
        name: 'Famille',
        color: 'SLATE',
    },
];

function FormHarness({
    initial,
    showsPrivacy,
    isEdition,
    submitted,
    newLabelOpenings,
}: {
    readonly initial: CalendarEventForm;
    readonly showsPrivacy: boolean;
    readonly isEdition: boolean;
    readonly submitted: CalendarEventForm[];
    readonly newLabelOpenings: number[];
}) {
    const { form, isAllDay, changeAllDay } = useCalendarEventForm(initial);
    return (
        <>
            <CalendarEventFormView
                formId={FORM_ID}
                form={form}
                isAllDay={isAllDay}
                isEdition={isEdition}
                showsPrivacy={showsPrivacy}
                labels={LABELS}
                onNewLabel={() =>
                    newLabelOpenings.push(newLabelOpenings.length + 1)
                }
                onAllDayChange={changeAllDay}
                onSubmit={(values) => submitted.push(values)}
            />
            <button
                type="submit"
                form={FORM_ID}
            >
                Ajouter
            </button>
        </>
    );
}

// The form of the drawer with its submit button, as the sheet places it; what it submits and opens is logged.
export function renderForm(
    initial = presentNewCalendarEvent('2026-11-24'),
    showsPrivacy = true,
    isEdition = false,
) {
    const submitted: CalendarEventForm[] = [];
    const newLabelOpenings: number[] = [];
    render(
        <WithI18n>
            <FormHarness
                initial={initial}
                showsPrivacy={showsPrivacy}
                isEdition={isEdition}
                submitted={submitted}
                newLabelOpenings={newLabelOpenings}
            />
        </WithI18n>,
    );
    return { submitted, newLabelOpenings, user: userEvent.setup() };
}

export const submit = (user: ReturnType<typeof userEvent.setup>) =>
    user.click(screen.getByRole('button', { name: 'Ajouter' }));
