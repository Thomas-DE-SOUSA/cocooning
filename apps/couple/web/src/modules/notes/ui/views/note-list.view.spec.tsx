import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { WithI18n } from '@/testing/with-i18n';
import { NoteCommandEnum } from '../../view-models/note-command.view-model';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';
import { NoteListView } from './note-list.view';

const MY_SHARED_NOTE: NoteListItem = {
    noteId: 'note-mine',
    title: 'Courses',
    isShared: true,
    isOwner: true,
    updatedAt: '23 nov. 2026, 17:05',
};
const PARTNER_NOTE: NoteListItem = {
    noteId: 'note-partner',
    title: 'Vacances',
    isShared: true,
    isOwner: false,
    updatedAt: '22 nov. 2026, 09:00',
};
const MY_PRIVATE_NOTE: NoteListItem = {
    ...MY_SHARED_NOTE,
    noteId: 'note-private',
    title: 'Idées cadeaux',
    isShared: false,
};

function renderList(
    notes: readonly NoteListItem[],
    overrides: Partial<ComponentProps<typeof NoteListView>> = {},
) {
    const taps: string[] = [];
    render(
        <WithI18n>
            <NoteListView
                notes={notes}
                pending={null}
                isBusy={false}
                deletionAsked={null}
                onShare={(noteId) => taps.push(`share:${noteId}`)}
                onMakePrivate={(noteId) => taps.push(`private:${noteId}`)}
                onAskDeletion={(noteId) => taps.push(`ask:${noteId}`)}
                onConfirmDeletion={(noteId) => taps.push(`delete:${noteId}`)}
                onKeep={() => taps.push('keep')}
                {...overrides}
            />
        </WithI18n>,
    );
    return { taps, user: userEvent.setup() };
}

const itemOf = (title: string) =>
    within(screen.getByRole('heading', { name: title }).closest('li')!);

describe('Feature: the list of the notes of the couple', () => {
    it('invites to create the first note when there is none', () => {
        renderList([]);
        expect(screen.getByText(/Pas encore de note/)).toBeTruthy();
    });

    it('tells whose note it is, its visibility and its last change', () => {
        renderList([PARTNER_NOTE]);
        expect(
            itemOf('Vacances').getByText(
                'Note de mon âme sœur · Partagée · Modifiée le 22 nov. 2026, 09:00',
            ),
        ).toBeTruthy();
    });

    it('R5, R7, offers no owner action on the note of the other partner', () => {
        renderList([PARTNER_NOTE]);
        expect(itemOf('Vacances').queryAllByRole('button')).toEqual([]);
    });

    it('R5, lets the owner make a shared note private and share a private one', async () => {
        const { taps, user } = renderList([MY_SHARED_NOTE, MY_PRIVATE_NOTE]);

        await user.click(
            itemOf('Courses').getByRole('button', { name: 'Rendre privée' }),
        );
        await user.click(
            itemOf('Idées cadeaux').getByRole('button', { name: 'Partager' }),
        );

        expect(taps).toEqual(['private:note-mine', 'share:note-private']);
    });

    it('R7, asks once more before deleting for both partners', async () => {
        const { taps, user } = renderList([MY_SHARED_NOTE], {
            deletionAsked: 'note-mine',
        });

        await user.click(
            screen.getByRole('button', { name: 'Supprimer pour nous deux' }),
        );
        await user.click(screen.getByRole('button', { name: 'Garder' }));

        expect(taps).toEqual(['delete:note-mine', 'keep']);
    });

    it('spins on the running note only and waits on every button', () => {
        renderList([MY_SHARED_NOTE, MY_PRIVATE_NOTE], {
            pending: {
                command: NoteCommandEnum.SHARE_NOTE,
                noteId: 'note-private',
            },
            isBusy: true,
        });

        expect(
            itemOf('Idées cadeaux').getByLabelText('Partage en cours'),
        ).toBeTruthy();
        expect(
            screen
                .getAllByRole('button')
                .every((button) => button.hasAttribute('disabled')),
        ).toBe(true);
    });
});
