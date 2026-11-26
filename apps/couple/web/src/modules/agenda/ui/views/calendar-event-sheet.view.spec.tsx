import { Drawer } from '@cocooning/design-system';
import { fireEvent, render, screen } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import { useCalendarEventForm } from '../../hooks/use-calendar-event-form';
import { presentNewCalendarEvent } from '../../presenters/calendar-event-form.presenter';
import {
    type CalendarEventCommand,
    CalendarEventCommandEnum,
} from '../../view-models/calendar-event-command.view-model';
import { CalendarEventSheetView } from './calendar-event-sheet.view';

type SheetState = {
    readonly isEdition: boolean;
    readonly pending: CalendarEventCommand | null;
    readonly isDeletionAsked: boolean;
};

function SheetHarness({
    state,
    events,
}: {
    readonly state: SheetState;
    readonly events: string[];
}) {
    const { form, isAllDay, changeAllDay } = useCalendarEventForm(
        presentNewCalendarEvent('2026-11-24'),
    );
    return (
        <Drawer open>
            <CalendarEventSheetView
                {...state}
                form={form}
                isAllDay={isAllDay}
                showsPrivacy
                labels={[]}
                onNewLabel={() => events.push('newLabel')}
                isBusy={state.pending !== null}
                onAllDayChange={changeAllDay}
                onCancel={() => events.push('cancel')}
                onSubmit={() => events.push('submit')}
                onAskDeletion={() => events.push('askDeletion')}
                onConfirmDeletion={() => events.push('confirmDeletion')}
                onKeep={() => events.push('keep')}
            />
        </Drawer>
    );
}

function renderSheet(state: Partial<SheetState>) {
    const events: string[] = [];
    render(
        <WithI18n>
            <SheetHarness
                state={{
                    isEdition: false,
                    pending: null,
                    isDeletionAsked: false,
                    ...state,
                }}
                events={events}
            />
        </WithI18n>,
    );
    return { events };
}

const button = (name: string) => screen.getByRole('button', { name });

describe('Feature: the drawer of an event', () => {
    describe('Scenario: a new event', () => {
        it('is named "Nouvel événement", cancels and adds, without a deletion', () => {
            const { events } = renderSheet({});

            expect(
                screen.getByRole('dialog', { name: 'Nouvel événement' }),
            ).toBeTruthy();
            fireEvent.click(button('Annuler'));
            expect(button('Ajouter').getAttribute('form')).toBe(
                'calendar-event-form',
            );
            expect(screen.queryByText("Supprimer l'événement")).toBeNull();
            expect(events).toEqual(['cancel']);
        });

        it('spins while the event is added', () => {
            renderSheet({
                pending: CalendarEventCommandEnum.CREATE_CALENDAR_EVENT,
            });

            expect(screen.getByLabelText('Ajout en cours')).toBeTruthy();
        });
    });

    describe('Scenario: R9, an edited event', () => {
        it('is named "Modifier l\'événement" and asks before deleting', () => {
            const { events } = renderSheet({ isEdition: true });

            expect(
                screen.getByRole('dialog', { name: "Modifier l'événement" }),
            ).toBeTruthy();
            expect(button('Enregistrer')).toBeTruthy();
            fireEvent.click(button("Supprimer l'événement"));
            expect(events).toEqual(['askDeletion']);
        });

        it('confirms the deletion for both partners, or keeps the event', () => {
            const { events } = renderSheet({
                isEdition: true,
                isDeletionAsked: true,
            });

            fireEvent.click(button('Supprimer pour nous deux'));
            fireEvent.click(button('Garder'));

            expect(events).toEqual(['confirmDeletion', 'keep']);
        });

        it('spins on the confirmation while the event is deleted, every button waiting', () => {
            renderSheet({
                isEdition: true,
                isDeletionAsked: true,
                pending: CalendarEventCommandEnum.DELETE_CALENDAR_EVENT,
            });

            expect(screen.getByLabelText('Suppression en cours')).toBeTruthy();
            expect(button('Enregistrer').hasAttribute('disabled')).toBe(true);
            expect(button('Garder').hasAttribute('disabled')).toBe(true);
        });
    });
});
