import type { TFunction } from 'i18next';
import { getServerTranslation } from '@/i18n/server';
import { NOTE_SPACE_NAMESPACE } from '../data/note-space-i18n-namespaces';
import { presentFolderDeletion } from './folder-deletion.presenter';

describe('Feature: what the deletion of a folder says (R16)', () => {
    let t: TFunction;

    beforeAll(async () => {
        t = await getServerTranslation(NOTE_SPACE_NAMESPACE);
    });

    it.each([
        [
            { noteCount: 4, folderCount: 1 },
            "Ses 4 notes et son dossier remontent dans « Partagé ». Aucune note n'est supprimée.",
        ],
        [
            { noteCount: 1, folderCount: 2 },
            "Sa note et ses 2 dossiers remontent dans « Partagé ». Aucune note n'est supprimée.",
        ],
        [
            { noteCount: 1, folderCount: 0 },
            "Sa note remonte dans « Partagé ». Aucune note n'est supprimée.",
        ],
        [
            { noteCount: 3, folderCount: 0 },
            "Ses 3 notes remontent dans « Partagé ». Aucune note n'est supprimée.",
        ],
        [
            { noteCount: 0, folderCount: 1 },
            "Son dossier remonte dans « Partagé ». Aucune note n'est supprimée.",
        ],
        [
            { noteCount: 0, folderCount: 2 },
            "Ses 2 dossiers remontent dans « Partagé ». Aucune note n'est supprimée.",
        ],
    ])('tells where the content of %o goes', (counts, text) => {
        expect(presentFolderDeletion(counts, 'Partagé', t)).toBe(text);
    });

    it('says an empty folder leaves nothing behind', () => {
        expect(
            presentFolderDeletion(
                { noteCount: 0, folderCount: 0 },
                'Maison',
                t,
            ),
        ).toBe('Ce dossier est vide.');
    });
});
