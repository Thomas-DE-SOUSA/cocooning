import { Drawer, DrawerContent } from '@cocooning/design-system';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithI18n } from '@/testing/with-i18n';
import { ClearDoneSheetView } from './clear-done-sheet.view';

describe('Feature: « Vider les faits » asks once more (R31)', () => {
    it('says how many lines go for both, then clears or keeps them', async () => {
        const journal: string[] = [];
        render(
            <WithI18n>
                <Drawer open>
                    <DrawerContent>
                        <ClearDoneSheetView
                            count={3}
                            onConfirm={() => journal.push('clear')}
                            onKeep={() => journal.push('keep')}
                        />
                    </DrawerContent>
                </Drawer>
            </WithI18n>,
        );
        const user = userEvent.setup();

        expect(
            screen.getByText(
                'Les 3 lignes cochées disparaissent pour vous deux.',
            ),
        ).toBeTruthy();
        await user.click(
            screen.getByRole('button', { name: 'Vider pour nous deux' }),
        );
        await user.click(screen.getByRole('button', { name: 'Garder' }));

        expect(journal).toEqual(['clear', 'keep']);
    });
});
