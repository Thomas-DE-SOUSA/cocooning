import { screen, waitFor } from '@testing-library/react';
import { presentNewCalendarEvent } from '../../presenters/calendar-event-form.presenter';
import {
    renderForm,
    SPORT_ID,
    submit,
} from './__tests__/calendar-event-form-harness';

describe('Feature: who the event is for and its label, in the drawer', () => {
    describe('Scenario: R11, who the event is for', () => {
        const radio = (name: string) => screen.getByRole('radio', { name });

        it('starts on "Nous deux" and sends the choice', async () => {
            const { submitted, user } = renderForm();
            expect(radio('Nous deux').getAttribute('aria-checked')).toBe(
                'true',
            );

            await user.type(screen.getByLabelText('Titre'), 'Dentiste');
            await user.click(radio('Toi'));
            await submit(user);

            await waitFor(() =>
                expect(submitted[0]).toMatchObject({ audience: 'YOU' }),
            );
            expect(radio('Toi').getAttribute('aria-checked')).toBe('true');
        });

        it('turns "Rien que pour moi" off at creation when "Toi" is picked', async () => {
            const { submitted, user } = renderForm();
            const privacy = screen.getByRole('switch', {
                name: 'Rien que pour moi',
            });

            await user.type(screen.getByLabelText('Titre'), 'Dentiste');
            await user.click(privacy);
            expect(radio('Moi').getAttribute('aria-checked')).toBe('true');
            await user.click(radio('Toi'));
            await submit(user);

            expect(privacy.getAttribute('aria-checked')).toBe('false');
            await waitFor(() =>
                expect(submitted[0]).toMatchObject({
                    audience: 'YOU',
                    isPrivate: false,
                }),
            );
        });

        it('keeps the visibility in an edit and refuses a private event for "Toi"', async () => {
            const { submitted, user } = renderForm(
                {
                    ...presentNewCalendarEvent('2026-11-24'),
                    title: 'Cadeau',
                    isPrivate: true,
                    audience: 'ME',
                },
                true,
                true,
            );

            await user.click(radio('Toi'));
            await submit(user);

            expect(
                await screen.findByText(
                    'Un événement rien que pour moi est pour moi.',
                ),
            ).toBeTruthy();
            expect(submitted).toEqual([]);
        });
    });

    describe('Scenario: R13, the label of the event', () => {
        const radio = (name: string) => screen.getByRole('radio', { name });

        it('picks a label, and leaves it on a second tap', async () => {
            const { submitted, user } = renderForm();

            await user.type(screen.getByLabelText('Titre'), 'Piscine');
            await user.click(radio('Sport'));
            expect(radio('Sport').getAttribute('aria-checked')).toBe('true');
            await submit(user);
            await waitFor(() =>
                expect(submitted[0]).toMatchObject({ labelId: SPORT_ID }),
            );

            await user.click(radio('Sport'));
            await submit(user);
            await waitFor(() =>
                expect(submitted[1]).toMatchObject({ labelId: null }),
            );
        });

        it('opens a new label from "+ Nouvelle"', async () => {
            const { newLabelOpenings, user } = renderForm();

            await user.click(
                screen.getByRole('button', { name: '+ Nouvelle' }),
            );

            expect(newLabelOpenings).toEqual([1]);
        });
    });
});
