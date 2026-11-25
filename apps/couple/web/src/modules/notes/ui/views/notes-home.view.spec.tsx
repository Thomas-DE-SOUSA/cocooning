import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { render, screen } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import type {
    NoteListItem,
    NoteSpaceCard,
} from '../../view-models/notes-screen.view-model';
import { NotesHomeView } from './notes-home.view';

const SPACES: readonly NoteSpaceCard[] = [
    {
        space: NoteSpaceEnum.SHARED,
        href: '/spaces/SHARED',
        folderCount: 3,
        noteCount: 9,
    },
    {
        space: NoteSpaceEnum.PRIVATE,
        href: '/spaces/PRIVATE',
        folderCount: 1,
        noteCount: 1,
    },
];
const COURSES: NoteListItem = {
    noteId: 'n1',
    href: '/notes/n1',
    title: 'Courses',
    isShared: true,
    isOwner: true,
    updatedAt: '23 nov. 2026, 17:05',
};

function renderHome(recentNotes: readonly NoteListItem[]) {
    render(
        <WithI18n>
            <NotesHomeView
                spaces={SPACES}
                recentNotes={recentNotes}
            />
        </WithI18n>,
    );
}

describe('Feature: the home of the notes (decision 0053)', () => {
    it('R10, opens « Partagé » and « Privé », each with who sees it and what it holds', () => {
        renderHome([]);

        expect(
            screen.getByRole('link', { name: 'Partagé' }).getAttribute('href'),
        ).toBe('/spaces/SHARED');
        expect(
            screen.getByText('Vu par vous deux · 3 dossiers, 9 notes'),
        ).not.toBeNull();
        expect(
            screen.getByText('Rien que pour toi · 1 dossier, 1 note'),
        ).not.toBeNull();
    });

    it('lists the notes changed last with their space and their last change', () => {
        renderHome([
            COURSES,
            { ...COURSES, noteId: 'n2', title: 'Idées', isShared: false },
        ]);

        expect(
            screen.getByRole('heading', { name: 'Modifiées récemment' }),
        ).not.toBeNull();
        expect(
            screen.getByRole('link', { name: 'Courses' }).getAttribute('href'),
        ).toBe('/notes/n1');
        expect(
            screen.getByText('Partagé · Modifiée le 23 nov. 2026, 17:05'),
        ).not.toBeNull();
        expect(
            screen.getByText('Privé · Modifiée le 23 nov. 2026, 17:05'),
        ).not.toBeNull();
    });

    it('offers no « + » and says where the first note is created', () => {
        renderHome([]);

        expect(screen.queryByRole('button')).toBeNull();
        expect(
            screen.getByText(/Ouvre « Partagé » pour créer la première/),
        ).not.toBeNull();
    });
});
