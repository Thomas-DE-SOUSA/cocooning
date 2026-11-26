import { screen, waitFor } from '@testing-library/react';
import { presentNewCalendarEvent } from '../../presenters/calendar-event-form.presenter';
import { renderForm, submit } from './__tests__/calendar-event-form-harness';

describe('Feature: the form of an event in the drawer', () => {
    describe('Scenario: R2, R3, R5, a new event on the chosen day', () => {
        it('submits the trimmed title, all day, shared', async () => {
            const { submitted, user } = renderForm();

            await user.type(screen.getByLabelText('Titre'), '  Cinéma ');
            await submit(user);

            await waitFor(() =>
                expect(submitted).toEqual([
                    {
                        ...presentNewCalendarEvent('2026-11-24'),
                        title: 'Cinéma',
                    },
                ]),
            );
        });

        it('shows the error under the title and submits nothing', async () => {
            const { submitted, user } = renderForm();

            await submit(user);

            expect(
                await screen.findByText("Donnez un titre à l'événement."),
            ).toBeTruthy();
            expect(submitted).toEqual([]);
        });

        it('R3, R11, asks for "rien que pour moi", then for me', async () => {
            const { submitted, user } = renderForm();

            await user.type(screen.getByLabelText('Titre'), 'Cadeau');
            await user.click(
                screen.getByRole('switch', { name: 'Rien que pour moi' }),
            );
            await submit(user);

            await waitFor(() =>
                expect(submitted[0]).toMatchObject({
                    isPrivate: true,
                    audience: 'ME',
                }),
            );
        });
    });

    describe('Scenario: R5, hours of the event', () => {
        it('shows the hours once "Toute la journée" is off', async () => {
            const { user } = renderForm();
            expect(screen.queryByLabelText('De')).toBeNull();

            await user.click(
                screen.getByRole('switch', { name: 'Toute la journée' }),
            );

            expect(screen.getByLabelText('De').getAttribute('type')).toBe(
                'time',
            );
            expect(screen.getByLabelText('À')).toBeTruthy();
        });

        it('refuses an end hour before the start hour, under the hours', async () => {
            const { submitted, user } = renderForm({
                ...presentNewCalendarEvent('2026-11-24'),
                title: 'Cinéma',
                startsAt: '20:00',
                endsAt: '19:00',
            });

            await submit(user);

            expect(
                await screen.findByText(
                    "L'heure de fin vient après l'heure de début.",
                ),
            ).toBeTruthy();
            expect(submitted).toEqual([]);
        });

        it('clears the hours when "Toute la journée" is turned on', async () => {
            const { submitted, user } = renderForm({
                ...presentNewCalendarEvent('2026-11-24'),
                title: 'Cinéma',
                startsAt: '20:00',
            });

            await user.click(
                screen.getByRole('switch', { name: 'Toute la journée' }),
            );
            await submit(user);

            await waitFor(() =>
                expect(submitted[0]).toMatchObject({
                    startsAt: null,
                    endsAt: null,
                }),
            );
        });
    });

    describe('Scenario: R5, a stay of several days', () => {
        it('removes the last day on request', async () => {
            const { submitted, user } = renderForm({
                ...presentNewCalendarEvent('2026-11-28'),
                title: 'Week-end',
                endsOn: '2026-11-29',
            });

            await user.click(
                screen.getByRole('button', { name: 'Retirer le dernier jour' }),
            );
            await submit(user);

            await waitFor(() => expect(submitted[0]?.endsOn).toBeNull());
            expect(
                screen.queryByRole('button', {
                    name: 'Retirer le dernier jour',
                }),
            ).toBeNull();
        });
    });

    describe('Scenario: R8, the other partner edits a shared event', () => {
        it('hides the visibility row', () => {
            renderForm(presentNewCalendarEvent('2026-11-24'), false);

            expect(screen.queryByText('Rien que pour moi')).toBeNull();
        });
    });
});
