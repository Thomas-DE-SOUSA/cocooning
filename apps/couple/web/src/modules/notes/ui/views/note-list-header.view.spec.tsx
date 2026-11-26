import { render, screen } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import { NoteListHeaderView } from './note-list-header.view';

const CARREFOUR = {
    noteId: '01936b2e-7c4a-7000-8000-0000000000e1',
    title: 'Carrefour',
    emoji: '🛒',
    kind: 'GROCERIES' as const,
    isShared: true,
    isOwner: true,
    backHref: '/lists?section=GROCERIES',
    viewerId: 'me',
};

describe('Feature: the head of a list (R26)', () => {
    it('goes back to its section and says for whom it is', () => {
        render(
            <WithI18n>
                <NoteListHeaderView list={CARREFOUR} />
            </WithI18n>,
        );

        expect(
            screen.getByRole('link', { name: 'Courses' }).getAttribute('href'),
        ).toBe('/lists?section=GROCERIES');
        expect(
            screen.getByRole('heading', { level: 1, name: '🛒 Carrefour' }),
        ).toBeTruthy();
        expect(screen.getByText('Commune')).toBeTruthy();
    });

    it('shows a private list without emoji', () => {
        render(
            <WithI18n>
                <NoteListHeaderView
                    list={{ ...CARREFOUR, emoji: null, isShared: false }}
                />
            </WithI18n>,
        );

        expect(
            screen.getByRole('heading', { level: 1, name: 'Carrefour' }),
        ).toBeTruthy();
        expect(screen.getByText('Rien que pour moi')).toBeTruthy();
    });
});
