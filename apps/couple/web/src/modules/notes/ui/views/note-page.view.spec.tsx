import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { fireEvent, render, screen } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import { NOTE_NAMESPACE } from '../../data/note-page-i18n-namespaces';
import { useNoteTitleForm } from '../../hooks/use-note-title-form';
import type { NotePlace } from '../../view-models/note-place.view-model';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';
import { NotePageView } from './note-page.view';

const CHEZ_PAUL: NoteListItem = {
    noteId: 'n1',
    href: '/notes/n1',
    title: 'Chez Paul',
    isShared: true,
    isOwner: true,
    updatedAt: '23 nov. 2026, 17:05',
};
const PRIVATE_ROOT: NotePlace = {
    space: NoteSpaceEnum.PRIVATE,
    folder: null,
    href: '/spaces/PRIVATE',
};

function PageHarness({
    place,
    events,
}: {
    readonly place: NotePlace;
    readonly events: string[];
}) {
    const form = useNoteTitleForm(NOTE_NAMESPACE, CHEZ_PAUL.title);
    return (
        <NotePageView
            note={CHEZ_PAUL}
            place={place}
            form={form}
            isRenaming={false}
            onRename={() => events.push('rename')}
            onActions={() => events.push('actions')}
        />
    );
}

function renderPage(place: NotePlace) {
    const events: string[] = [];
    render(
        <WithI18n>
            <PageHarness
                place={place}
                events={events}
            />
        </WithI18n>,
    );
    return { events };
}

describe('Feature: the head of the page of a note (decision 0053)', () => {
    it('goes back to the folder of the note', () => {
        renderPage({
            space: NoteSpaceEnum.SHARED,
            folder: { folderId: 'f1', name: 'Restaurants' },
            href: '/spaces/SHARED?folderId=f1',
        });

        expect(
            screen
                .getByRole('link', { name: 'Restaurants' })
                .getAttribute('href'),
        ).toBe('/spaces/SHARED?folderId=f1');
    });

    it('goes back to the root of its space, named after it', () => {
        renderPage(PRIVATE_ROOT);

        expect(
            screen.getByRole('link', { name: 'Privé' }).getAttribute('href'),
        ).toBe('/spaces/PRIVATE');
    });

    it('opens the actions of the note from its « ⋯ »', () => {
        const { events } = renderPage(PRIVATE_ROOT);

        fireEvent.click(
            screen.getByRole('button', { name: 'Actions sur la note' }),
        );
        expect(events).toEqual(['actions']);
    });
});
