import { render, screen } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import { presentNoteListsTabs } from '../../presenters/note-lists-query.presenter';
import type { NoteListsSection } from '../../view-models/note-lists-screen.view-model';
import { NoteListsHomeView } from './note-lists-home.view';

const A_CARD = (title: string, openItemCount: number) => ({
    noteId: title,
    href: `/lists/${title}`,
    title,
    emoji: null,
    openItemCount,
});

function renderHome(
    lists: Parameters<typeof NoteListsHomeView>[0]['lists'],
    section: NoteListsSection = 'GROCERIES',
) {
    render(
        <WithI18n>
            <NoteListsHomeView
                tabs={presentNoteListsTabs(section)}
                lists={lists}
            />
        </WithI18n>,
    );
}

describe('Feature: the home of the Lists tab (R28)', () => {
    it('marks the section shown among Courses, Tâches and Envies', () => {
        renderHome({ kind: 'GROCERIES', shared: [], mine: [] });

        expect(
            screen
                .getByRole('link', { name: 'Courses' })
                .getAttribute('aria-current'),
        ).toBe('page');
        expect(
            screen.getByRole('link', { name: 'Tâches' }).getAttribute('href'),
        ).toBe('/lists?section=TASKS');
        expect(
            screen
                .getByRole('link', { name: 'Envies' })
                .getAttribute('aria-current'),
        ).toBe('false');
    });

    it('groups the lists and says what is left to take', () => {
        renderHome({
            kind: 'GROCERIES',
            shared: [A_CARD('Carrefour', 4), A_CARD('Pharmacie', 1)],
            mine: [A_CARD('Salle de bain', 0)],
        });

        expect(screen.getByRole('heading', { name: 'Communes' })).toBeTruthy();
        expect(
            screen.getByRole('heading', { name: 'Rien que pour moi' }),
        ).toBeTruthy();
        expect(
            screen.getByRole('link', { name: /Carrefour/ }).textContent,
        ).toContain('4 à prendre');
        expect(
            screen.getByRole('link', { name: /Salle de bain/ }).textContent,
        ).toContain('Tout est pris');
    });

    it('says what is left to do in Tâches, and hides an empty group', () => {
        renderHome(
            { kind: 'TASKS', shared: [], mine: [A_CARD('Noël', 2)] },
            'TASKS',
        );

        expect(
            screen.getByRole('link', { name: /Noël/ }).textContent,
        ).toContain('2 à faire');
        expect(screen.queryByRole('heading', { name: 'Communes' })).toBeNull();
    });

    it('invites to create the first list of a section', () => {
        renderHome({ kind: 'TASKS', shared: [], mine: [] }, 'TASKS');

        expect(screen.getByText(/Pas encore de liste de tâches/)).toBeTruthy();
    });

    it('announces the wishes for later', () => {
        renderHome(null, 'WISHES');

        expect(screen.getByText('Les envies arrivent bientôt.')).toBeTruthy();
    });
});
