import { render, screen, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { WithI18n } from '@/testing/with-i18n';
import type { FolderListItem } from '../../view-models/note-space-screen.view-model';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';
import { NoteSpaceContentsView } from './note-space-contents.view';

const MAISON: FolderListItem = {
    folderId: 'f1',
    name: 'Maison',
    href: '/spaces/SHARED?folderId=f1',
    folderCount: 1,
    noteCount: 4,
};
const COURSES: NoteListItem = {
    noteId: 'n1',
    href: '/notes/n1',
    title: 'Courses',
    isShared: true,
    isOwner: false,
    updatedAt: '23 nov. 2026, 17:05',
};

function renderContents(
    props: Partial<ComponentProps<typeof NoteSpaceContentsView>>,
) {
    render(
        <WithI18n>
            <NoteSpaceContentsView
                folders={[]}
                notes={[]}
                {...props}
            />
        </WithI18n>,
    );
}

const sectionOf = (title: string) =>
    within(screen.getByRole('heading', { name: title }).closest('section')!);

describe('Feature: what a space or a folder holds (R13)', () => {
    it('lists the folders, each with what it holds, then the notes', () => {
        renderContents({ folders: [MAISON], notes: [COURSES] });

        const headings = screen
            .getAllByRole('heading', { level: 2 })
            .map((heading) => heading.textContent);
        expect(headings).toEqual(['Dossiers', 'Notes']);
        expect(
            sectionOf('Dossiers')
                .getByRole('link', { name: 'Maison' })
                .getAttribute('href'),
        ).toBe('/spaces/SHARED?folderId=f1');
        expect(
            sectionOf('Dossiers').getByText('1 dossier · 4 notes'),
        ).not.toBeNull();
    });

    it('opens a note from its title and tells whose it is', () => {
        renderContents({ notes: [COURSES] });

        expect(
            screen.getByRole('link', { name: 'Courses' }).getAttribute('href'),
        ).toBe('/notes/n1');
        expect(
            screen.getByText(
                'Note de mon âme sœur · Modifiée le 23 nov. 2026, 17:05',
            ),
        ).not.toBeNull();
        expect(screen.queryByRole('heading', { name: 'Dossiers' })).toBeNull();
    });

    it('says when the place is empty', () => {
        renderContents({});

        expect(screen.getByText(/Rien ici pour l'instant/)).not.toBeNull();
    });
});
