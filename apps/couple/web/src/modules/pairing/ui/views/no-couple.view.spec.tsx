import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithI18n } from '@/testing/with-i18n';
import { NoCoupleView } from './no-couple.view';

describe('Feature: the pairing screens', () => {
    describe('Scenario: R2, no couple yet', () => {
        it('creates the couple on a tap', async () => {
            const taps: string[] = [];
            render(
                <WithI18n>
                    <NoCoupleView
                        isPending={false}
                        onCreateCouple={() => taps.push('create')}
                    />
                </WithI18n>,
            );

            await userEvent.click(
                screen.getByRole('button', { name: 'Créer notre couple' }),
            );

            expect(taps).toEqual(['create']);
        });

        it('announces the creation in progress', () => {
            render(
                <WithI18n>
                    <NoCoupleView
                        isPending
                        onCreateCouple={() => undefined}
                    />
                </WithI18n>,
            );

            expect(screen.getByRole('button').hasAttribute('disabled')).toBe(
                true,
            );
            expect(
                screen.getByRole('status', { name: 'Création en cours' }),
            ).toBeTruthy();
        });
    });
});
