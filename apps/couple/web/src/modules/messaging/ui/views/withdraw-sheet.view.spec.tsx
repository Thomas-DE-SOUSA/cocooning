import { Drawer } from '@cocooning/design-system';
import { fireEvent, render, screen } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import { WithdrawSheetView } from './withdraw-sheet.view';

function renderSheet(isWithdrawing: boolean) {
    const events: string[] = [];
    render(
        <WithI18n>
            <Drawer open>
                <WithdrawSheetView
                    isWithdrawing={isWithdrawing}
                    isBusy={isWithdrawing}
                    onWithdraw={() => events.push('withdraw')}
                    onKeep={() => events.push('keep')}
                />
            </Drawer>
        </WithI18n>,
    );
    return { events };
}

describe('Feature: withdrawing what I sent (R6)', () => {
    it('withdraws for both of us, or keeps it', () => {
        const { events } = renderSheet(false);

        expect(
            screen.getByRole('dialog', { name: 'Retirer ce message ?' }),
        ).toBeTruthy();
        fireEvent.click(
            screen.getByRole('button', { name: 'Retirer pour nous deux' }),
        );
        fireEvent.click(screen.getByRole('button', { name: 'Garder' }));

        expect(events).toEqual(['withdraw', 'keep']);
    });

    it('spins while the item is withdrawn, every button waiting', () => {
        renderSheet(true);

        expect(screen.getByLabelText('Retrait en cours')).toBeTruthy();
        expect(
            screen
                .getByRole('button', { name: 'Garder' })
                .hasAttribute('disabled'),
        ).toBe(true);
    });
});
