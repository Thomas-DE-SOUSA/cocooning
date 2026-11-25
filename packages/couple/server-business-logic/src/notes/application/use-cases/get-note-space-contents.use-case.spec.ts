import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    FolderKindEnum,
    type NoteSpace,
    NoteSpaceEnum,
    NoteVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import type { Folder } from '../../domain/models/folder.aggregate';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    NOW,
    NotesTestContext,
    PARTNER_A,
} from '../../__tests__/fixtures/notes-test.context';

describe('Feature: open a space or one of its folders (R10, R14)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const open = (
        context: typeof AS_A,
        space: NoteSpace,
        folder: Folder | null = null,
    ) =>
        ctx.getNoteSpaceContentsUseCase().execute(context, {
            space,
            folderId: folder === null ? null : folder.id.getValue(),
        });

    describe('Scenario: R10, R12, the root of « Partagé »', () => {
        it('shows its folders by name with what they hold, and its notes', async () => {
            const sorties = ctx.givenFolderOf(AS_B, 'Sorties');
            const restaurants = ctx.givenFolderOf(AS_A, 'Restaurants');
            ctx.givenFolderOf(AS_A, 'Italiens', restaurants);
            ctx.givenNoteOf(AS_A, 'Chez Luigi', restaurants);
            const courses = ctx.givenNoteOf(AS_A, 'Courses');
            ctx.givenPrivateNoteOf(AS_A, 'Idées cadeaux');
            await expect(open(AS_A, NoteSpaceEnum.SHARED)).resolves.toEqual({
                space: NoteSpaceEnum.SHARED,
                path: [],
                cardContext: null,
                folders: [
                    {
                        folderId: restaurants.id.getValue(),
                        space: NoteSpaceEnum.SHARED,
                        kind: FolderKindEnum.CLASSIC,
                        parentFolderId: null,
                        name: 'Restaurants',
                        subject: null,
                        cardTemplate: null,
                        updatedAt: NOW,
                        folderCount: 1,
                        noteCount: 1,
                    },
                    {
                        folderId: sorties.id.getValue(),
                        space: NoteSpaceEnum.SHARED,
                        kind: FolderKindEnum.CLASSIC,
                        parentFolderId: null,
                        name: 'Sorties',
                        subject: null,
                        cardTemplate: null,
                        updatedAt: NOW,
                        folderCount: 0,
                        noteCount: 0,
                    },
                ],
                notes: [
                    {
                        noteId: courses.id.getValue(),
                        ownerId: PARTNER_A,
                        isOwner: true,
                        title: 'Courses',
                        visibility: NoteVisibilityEnum.SHARED,
                        folderId: null,
                        updatedAt: NOW,
                        card: null,
                    },
                ],
            });
        });
    });

    describe('Scenario: a folder deep in its space', () => {
        it('gives the way from the root down to it', async () => {
            const sorties = ctx.givenFolderOf(AS_A, 'Sorties');
            const restaurants = ctx.givenFolderOf(AS_A, 'Restaurants', sorties);
            const contents = await open(
                AS_B,
                NoteSpaceEnum.SHARED,
                restaurants,
            );
            expect(contents.path).toEqual([
                { folderId: sorties.id.getValue(), name: 'Sorties' },
                { folderId: restaurants.id.getValue(), name: 'Restaurants' },
            ]);
        });
    });

    describe('Scenario: R10, each partner has their own « Privé »', () => {
        it('shows the private folders and notes of the reader only', async () => {
            ctx.givenPrivateFolderOf(AS_A, 'Cadeaux');
            ctx.givenPrivateNoteOf(AS_A, 'Idées cadeaux');
            const ofA = await open(AS_A, NoteSpaceEnum.PRIVATE);
            const ofB = await open(AS_B, NoteSpaceEnum.PRIVATE);
            expect(ofA.folders.map(({ name }) => name)).toEqual(['Cadeaux']);
            expect(ofA.notes.map(({ title }) => title)).toEqual([
                'Idées cadeaux',
            ]);
            expect(ofB).toEqual({
                space: NoteSpaceEnum.PRIVATE,
                path: [],
                cardContext: null,
                folders: [],
                notes: [],
            });
        });
    });

    describe('Scenario: R14, a folder of the other partner’s « Privé » or of another couple', () => {
        it.each([
            ['the other partner', AS_B],
            ['another couple', AS_STRANGER],
        ])('answers not found to %s', async (_label, context) => {
            const cadeaux = ctx.givenPrivateFolderOf(AS_A, 'Cadeaux');
            await expect(
                open(context, NoteSpaceEnum.PRIVATE, cadeaux),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
            });
        });
    });

    describe('Scenario: a folder opened under the other space', () => {
        it('refuses the mismatch', async () => {
            const restaurants = ctx.givenFolderOf(AS_A, 'Restaurants');
            await expect(
                open(AS_A, NoteSpaceEnum.PRIVATE, restaurants),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_SPACE_MISMATCH,
            });
        });
    });
});
