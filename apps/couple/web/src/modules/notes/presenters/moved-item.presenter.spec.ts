import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { MovedItemKindEnum } from '../view-models/moved-item.view-model';
import type { NotePlace } from '../view-models/note-place.view-model';
import type {
    FolderListItem,
    NotePlaceLevel,
} from '../view-models/note-space-screen.view-model';
import type { NoteListItem } from '../view-models/notes-screen.view-model';
import {
    isWhereItIs,
    presentMovedFolder,
    presentMovedNote,
    presentPickerFolders,
} from './moved-item.presenter';

const SHARED_ROOT: NotePlace = {
    space: NoteSpaceEnum.SHARED,
    folder: null,
    href: '/spaces/SHARED',
};
const aFolder = (folderId: string, name: string): FolderListItem => ({
    folderId,
    name,
    href: `/spaces/SHARED?folderId=${folderId}`,
    folderCount: 0,
    noteCount: 0,
});
const MAISON = aFolder('f1', 'Maison');
const TRAVAUX = aFolder('f2', 'Travaux');
const ROOT_LEVEL: NotePlaceLevel = {
    place: SHARED_ROOT,
    back: null,
    folders: [MAISON, TRAVAUX],
};
const COURSES: NoteListItem = {
    noteId: 'n1',
    href: '/notes/n1',
    title: 'Courses',
    isShared: true,
    isOwner: true,
    updatedAt: '23 nov. 2026, 17:05',
};

describe('Feature: what the move picker moves (R11, R15)', () => {
    it('R11, lets the owner put her note in either space', () => {
        expect(presentMovedNote(COURSES, SHARED_ROOT)).toEqual({
            kind: MovedItemKindEnum.NOTE,
            id: 'n1',
            name: 'Courses',
            from: { space: NoteSpaceEnum.SHARED, folderId: null },
            spaces: [NoteSpaceEnum.SHARED, NoteSpaceEnum.PRIVATE],
        });
    });

    it('R5, keeps the note of the other partner in « Partagé »', () => {
        expect(
            presentMovedNote({ ...COURSES, isOwner: false }, SHARED_ROOT)
                .spaces,
        ).toEqual([NoteSpaceEnum.SHARED]);
    });

    it('R15, keeps a folder in its space and never shows it inside itself', () => {
        const item = presentMovedFolder(MAISON, SHARED_ROOT);

        expect(item.spaces).toEqual([NoteSpaceEnum.SHARED]);
        expect(presentPickerFolders(ROOT_LEVEL, item)).toEqual([TRAVAUX]);
    });

    it('shows every folder of the level to a note', () => {
        const item = presentMovedNote(COURSES, SHARED_ROOT);

        expect(presentPickerFolders(ROOT_LEVEL, item)).toEqual([
            MAISON,
            TRAVAUX,
        ]);
    });

    it('tells whether the level shown is where the item already is', () => {
        const item = presentMovedNote(COURSES, SHARED_ROOT);
        const inMaison: NotePlaceLevel = {
            ...ROOT_LEVEL,
            place: {
                ...SHARED_ROOT,
                folder: { folderId: 'f1', name: 'Maison' },
            },
        };

        expect(isWhereItIs(ROOT_LEVEL, item)).toBe(true);
        expect(isWhereItIs(inMaison, item)).toBe(false);
        expect(
            isWhereItIs(
                {
                    ...ROOT_LEVEL,
                    place: { ...SHARED_ROOT, space: NoteSpaceEnum.PRIVATE },
                },
                item,
            ),
        ).toBe(false);
    });
});
