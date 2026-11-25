import { Drawer, DrawerContent } from '@cocooning/design-system';
import { fireEvent, render, screen } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import { NoteDeletionSheetView } from './note-deletion-sheet.view';

function renderSheet(isPending: boolean) {
    const events: string[] = [];
    render(
        <WithI18n>
            <Drawer open>
                <DrawerContent>
                    <NoteDeletionSheetView
                        title="Chez Paul"
                        isPending={isPending}
                        isBusy={isPending}
                        onConfirm={() => events.push('confirm')}
                        onKeep={() => events.push('keep')}
                    />
                </DrawerContent>
            </Drawer>
        </WithI18n>,
    );
    return { events };
}

describe('Feature: deleting a note for both partners (R7)', () => {
    it('asks once more, then deletes it or keeps it', () => {
        const { events } = renderSheet(false);

        expect(
            screen.getByRole('dialog', { name: 'Supprimer « Chez Paul » ?' }),
        ).not.toBeNull();
        fireEvent.click(
            screen.getByRole('button', { name: 'Supprimer pour nous deux' }),
        );
        fireEvent.click(screen.getByRole('button', { name: 'Garder' }));
        expect(events).toEqual(['confirm', 'keep']);
    });

    it('spins while the note is deleted, every button waiting', () => {
        renderSheet(true);

        expect(screen.getByLabelText('Suppression en cours')).not.toBeNull();
        expect(
            screen
                .getAllByRole('button')
                .every((button) => button.hasAttribute('disabled')),
        ).toBe(true);
    });
});
