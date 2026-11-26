import type { CalendarLabelForm } from '@cocooning/couple-client-business-logic/agenda';
import { Drawer } from '@cocooning/design-system';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithI18n } from '@/testing/with-i18n';
import { useCalendarLabelForm } from '../../hooks/use-calendar-label-form';
import {
    type CalendarLabelCommand,
    CalendarLabelCommandEnum,
} from '../../view-models/calendar-label-command.view-model';
import { CalendarLabelSheetView } from './calendar-label-sheet.view';

type SheetState = {
    readonly isEdition: boolean;
    readonly pending: CalendarLabelCommand | null;
    readonly isDeletionAsked: boolean;
};

function SheetHarness({
    state,
    events,
}: {
    readonly state: SheetState;
    readonly events: string[];
}) {
    const form = useCalendarLabelForm({ name: '', color: 'MINT' });
    return (
        <Drawer open>
            <CalendarLabelSheetView
                {...state}
                form={form}
                isBusy={state.pending !== null}
                onCancel={() => events.push('cancel')}
                onSubmit={(values: CalendarLabelForm) =>
                    events.push(`submit:${values.name}:${values.color}`)
                }
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
    return { events, user: userEvent.setup() };
}

describe('Feature: the sheet of a label', () => {
    describe('Scenario: R12, a new label', () => {
        it('takes a name and one of the eight colours, and says labels are shared', async () => {
            const { events, user } = renderSheet({});

            expect(
                screen.getByRole('dialog', { name: 'Nouvelle étiquette' }),
            ).toBeTruthy();
            expect(screen.getAllByRole('radio')).toHaveLength(8);
            expect(
                screen
                    .getByRole('radio', { name: 'Menthe' })
                    .getAttribute('aria-checked'),
            ).toBe('true');
            expect(
                screen.getByText(/Les étiquettes sont communes/),
            ).toBeTruthy();

            await user.type(screen.getByLabelText('Nom'), ' Verre ');
            await user.click(screen.getByRole('radio', { name: 'Rose' }));
            await user.click(screen.getByRole('button', { name: 'Créer' }));

            await waitFor(() => expect(events).toEqual(['submit:Verre:ROSE']));
        });

        it('shows the error under the name and sends nothing', async () => {
            const { events, user } = renderSheet({});

            await user.click(screen.getByRole('button', { name: 'Créer' }));

            expect(
                await screen.findByText("Donnez un nom à l'étiquette."),
            ).toBeTruthy();
            expect(events).toEqual([]);
        });
    });

    describe('Scenario: R14, an existing label', () => {
        it('is saved, and its deletion says its events stay', async () => {
            const { events, user } = renderSheet({
                isEdition: true,
                isDeletionAsked: true,
            });

            expect(
                screen.getByRole('dialog', { name: "Modifier l'étiquette" }),
            ).toBeTruthy();
            expect(
                screen.getByText(
                    'Les événements qui la portent restent, sans étiquette.',
                ),
            ).toBeTruthy();
            await user.click(
                screen.getByRole('button', {
                    name: 'Supprimer pour nous deux',
                }),
            );
            await user.click(screen.getByRole('button', { name: 'Garder' }));

            expect(events).toEqual(['confirmDeletion', 'keep']);
        });

        it('spins on the deletion while it runs', () => {
            renderSheet({
                isEdition: true,
                isDeletionAsked: true,
                pending: CalendarLabelCommandEnum.DELETE_CALENDAR_LABEL,
            });

            expect(screen.getByLabelText('Suppression en cours')).toBeTruthy();
            expect(
                screen
                    .getByRole('button', { name: 'Enregistrer' })
                    .getAttribute('aria-busy'),
            ).toBe('false');
        });
    });
});
