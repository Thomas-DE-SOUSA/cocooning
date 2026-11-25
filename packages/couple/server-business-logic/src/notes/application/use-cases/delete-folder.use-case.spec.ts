import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { FolderDeletedEvent } from '../../domain/events/folder-deleted.event';
import type { Folder } from '../../domain/models/folder.aggregate';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    MILLISECONDS_PER_HOUR,
    NOW,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';

const DELETED_AT = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);

describe('Feature: delete a folder (R14, R16)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const remove = (context: typeof AS_A, folder: Folder) =>
        ctx
            .deleteFolderUseCase()
            .execute(context, { folderId: folder.id.getValue() });

    const snapshotOf = (folder: Folder) =>
        ctx.folderRepository.storedSnapshots.find(
            ({ id }) => id === folder.id.getValue(),
        );

    describe('Scenario: R16, the other partner deletes a shared sub-folder', () => {
        let sorties: Folder;
        let restaurants: Folder;

        beforeEach(async () => {
            sorties = ctx.givenFolderOf(AS_A, 'Sorties');
            restaurants = ctx.givenFolderOf(AS_A, 'Restaurants', sorties);
            ctx.givenFolderOf(AS_A, 'Italiens', restaurants);
            ctx.givenNoteOf(AS_A, 'Chez Luigi', restaurants);
            ctx.advanceHours(1);
            await remove(AS_B, restaurants);
        });

        it('deletes it softly and records one event, in one unit of work', () => {
            expect(snapshotOf(restaurants)).toMatchObject({
                version: 2,
                metadata: { deletedAt: DELETED_AT.toISOString() },
            });
            const expected = {
                eventId: expect.stringMatching(/^00000000-0000-7000-8000-/),
                eventName: FolderDeletedEvent.EVENT_NAME,
                aggregateId: restaurants.id.getValue(),
                context: AS_B,
                data: null,
                occurredAt: DELETED_AT,
            };
            expect(ctx.folderRepository.persistedEvents).toEqual([expected]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
            expect(ctx.unitOfWork.runCount).toBe(1);
        });

        it('moves its notes and its sub-folders up to its parent', async () => {
            const contents = await ctx
                .getNoteSpaceContentsUseCase()
                .execute(AS_A, {
                    space: sorties.space,
                    folderId: sorties.id.getValue(),
                });
            expect(contents.folders.map(({ name }) => name)).toEqual([
                'Italiens',
            ]);
            expect(contents.notes.map(({ title }) => title)).toEqual([
                'Chez Luigi',
            ]);
        });
    });

    describe('Scenario: R16, a folder at the root of its space', () => {
        it('moves its content to the root', async () => {
            const restaurants = ctx.givenFolderOf(AS_A, 'Restaurants');
            ctx.givenNoteOf(AS_A, 'Chez Luigi', restaurants);
            await remove(AS_A, restaurants);
            expect(ctx.noteRepository.storedSnapshots[0]).toMatchObject({
                folderId: null,
                version: 2,
            });
        });
    });

    describe('Scenario: R14, a folder of the other partner’s « Privé » or of another couple', () => {
        it.each([
            ['the other partner', AS_B],
            ['another couple', AS_STRANGER],
        ])(
            'answers not found to %s and deletes nothing',
            async (_label, context) => {
                const cadeaux = ctx.givenPrivateFolderOf(AS_A, 'Cadeaux');
                await expect(remove(context, cadeaux)).rejects.toMatchObject({
                    code: NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
                });
                expect(snapshotOf(cadeaux)?.metadata.deletedAt).toBeNull();
                expect(ctx.unitOfWork.runCount).toBe(0);
            },
        );
    });
});
