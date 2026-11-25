import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import type { TFunction } from 'i18next';
import { getServerTranslation } from '@/i18n/server';
import { NOTE_SPACE_NAMESPACE } from '../data/note-space-i18n-namespaces';
import {
    presentFolderContents,
    presentPlaceName,
} from './place-labels.presenter';

describe('Feature: the words of a place of the notes', () => {
    let t: TFunction;

    beforeAll(async () => {
        t = await getServerTranslation(NOTE_SPACE_NAMESPACE);
    });

    it.each([
        [NoteSpaceEnum.SHARED, 'Partagé'],
        [NoteSpaceEnum.PRIVATE, 'Privé'],
    ])('R10, names the root of %s', (space, name) => {
        expect(presentPlaceName({ space, folder: null, href: '/' }, t)).toBe(
            name,
        );
    });

    it('names a folder by its own name', () => {
        const folder = { folderId: 'f1', name: 'Maison' };
        expect(
            presentPlaceName(
                { space: NoteSpaceEnum.SHARED, folder, href: '/' },
                t,
            ),
        ).toBe('Maison');
    });

    it.each([
        [{ folderCount: 2, noteCount: 8 }, '2 dossiers · 8 notes'],
        [{ folderCount: 1, noteCount: 1 }, '1 dossier · 1 note'],
        [{ folderCount: 0, noteCount: 4 }, '4 notes'],
        [{ folderCount: 3, noteCount: 0 }, '3 dossiers'],
        [{ folderCount: 0, noteCount: 0 }, 'Vide'],
    ])('tells what %o holds', (counts, text) => {
        expect(presentFolderContents(counts, t)).toBe(text);
    });
});
