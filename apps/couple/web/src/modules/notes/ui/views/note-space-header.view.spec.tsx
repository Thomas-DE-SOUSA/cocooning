import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { render, screen } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import type { NotePlace } from '../../view-models/note-place.view-model';
import { NoteSpaceHeaderView } from './note-space-header.view';

const SHARED_ROOT: NotePlace = {
    space: NoteSpaceEnum.SHARED,
    folder: null,
    href: '/spaces/SHARED',
};
const MAISON: NotePlace = {
    space: NoteSpaceEnum.SHARED,
    folder: { folderId: 'f1', name: 'Maison' },
    href: '/spaces/SHARED?folderId=f1',
};

function renderHeader(place: NotePlace, back: NotePlace | null) {
    render(
        <WithI18n>
            <NoteSpaceHeaderView
                place={place}
                back={back}
            />
        </WithI18n>,
    );
}

describe('Feature: the head of a space or a folder', () => {
    it('R10, names a space, tells who sees it and goes back to the notes', () => {
        renderHeader({ ...SHARED_ROOT, space: NoteSpaceEnum.PRIVATE }, null);

        expect(screen.getByRole('heading', { name: 'Privé' })).not.toBeNull();
        expect(screen.getByText('Rien que pour toi')).not.toBeNull();
        expect(
            screen.getByRole('link', { name: 'Notes' }).getAttribute('href'),
        ).toBe('/');
    });

    it('names a folder and goes back to the space above it', () => {
        renderHeader(MAISON, SHARED_ROOT);

        expect(screen.getByRole('heading', { name: 'Maison' })).not.toBeNull();
        expect(screen.queryByText('Vu par vous deux')).toBeNull();
        expect(
            screen.getByRole('link', { name: 'Partagé' }).getAttribute('href'),
        ).toBe('/spaces/SHARED');
    });

    it('goes back from a sub-folder to its parent folder', () => {
        renderHeader(
            { ...MAISON, folder: { folderId: 'f2', name: 'Travaux' } },
            MAISON,
        );

        expect(
            screen.getByRole('link', { name: 'Maison' }).getAttribute('href'),
        ).toBe('/spaces/SHARED?folderId=f1');
    });
});
