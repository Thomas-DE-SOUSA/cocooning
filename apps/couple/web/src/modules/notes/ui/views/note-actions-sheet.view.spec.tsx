import { Drawer, DrawerContent } from '@cocooning/design-system';
import { fireEvent, render, screen } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';
import { NoteActionsSheetView } from './note-actions-sheet.view';

const MY_NOTE: NoteListItem = {
    noteId: 'n1',
    href: '/notes/n1',
    title: 'Chez Paul',
    isShared: true,
    isOwner: true,
    updatedAt: '23 nov. 2026, 17:05',
};

function renderSheet(note: NoteListItem) {
    const events: string[] = [];
    render(
        <WithI18n>
            <Drawer open>
                <DrawerContent>
                    <NoteActionsSheetView
                        note={note}
                        onMove={() => events.push('move')}
                        onAskDeletion={() => events.push('delete')}
                    />
                </DrawerContent>
            </Drawer>
        </WithI18n>,
    );
    return { events };
}

describe('Feature: the actions on a note (R5, R7, R11)', () => {
    it('lets the owner move or delete her note', () => {
        const { events } = renderSheet(MY_NOTE);

        expect(
            screen.getByRole('dialog', { name: 'Chez Paul' }),
        ).not.toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Déplacer' }));
        fireEvent.click(
            screen.getByRole('button', { name: 'Supprimer la note' }),
        );
        expect(events).toEqual(['move', 'delete']);
    });

    it('only moves the note of the other partner, and says why', () => {
        renderSheet({ ...MY_NOTE, isOwner: false });

        expect(screen.getByText('Note de mon âme sœur')).not.toBeNull();
        expect(
            screen.queryByRole('button', { name: 'Supprimer la note' }),
        ).toBeNull();
        expect(
            screen.getByText(
                'Seule ton âme sœur peut supprimer sa note ou la ranger dans son « Privé ».',
            ),
        ).not.toBeNull();
    });
});
