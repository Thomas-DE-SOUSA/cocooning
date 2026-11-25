import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { FolderMovedEvent } from '../../domain/events/folder-moved.event';
import type { Folder } from '../../domain/models/folder.aggregate';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    MILLISECONDS_PER_HOUR,
    NOW,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';

const MOVED_AT = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);

describe('Feature: move a folder (R14, R15)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const move = (
        context: typeof AS_A,
        folder: Folder,
        parent: Folder | null,
    ) =>
        ctx.moveFolderUseCase().execute(context, {
            folderId: folder.id.getValue(),
            parentFolderId: parent === null ? null : parent.id.getValue(),
        });

    describe('Scenario: R15, the other partner moves a shared folder into another one', () => {
        it('changes its parent, stores it and records one event', async () => {
            const restaurants = ctx.givenFolderOf(AS_A, 'Restaurants');
            const sorties = ctx.givenFolderOf(AS_A, 'Sorties');
            ctx.advanceHours(1);
            const view = await move(AS_B, restaurants, sorties);
            expect(view).toMatchObject({
                parentFolderId: sorties.id.getValue(),
                updatedAt: MOVED_AT,
            });
            expect(
                ctx.folderRepository.storedSnapshots.find(
                    ({ id }) => id === restaurants.id.getValue(),
                ),
            ).toMatchObject({
                parentFolderId: sorties.id.getValue(),
                version: 2,
            });
            const expected = {
                eventId: expect.stringMatching(/^00000000-0000-7000-8000-/),
                eventName: FolderMovedEvent.EVENT_NAME,
                aggregateId: restaurants.id.getValue(),
                context: AS_B,
                data: { parentFolderId: sorties.id.getValue() },
                occurredAt: MOVED_AT,
            };
            expect(ctx.folderRepository.persistedEvents).toEqual([expected]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
        });
    });

    describe('Scenario: R15, a sub-folder moves back to the root of its space', () => {
        it('has no parent any more', async () => {
            const sorties = ctx.givenFolderOf(AS_A, 'Sorties');
            const restaurants = ctx.givenFolderOf(AS_A, 'Restaurants', sorties);
            const view = await move(AS_A, restaurants, null);
            expect(view.parentFolderId).toBeNull();
        });
    });

    describe('Scenario: R15, a shared folder moves into « Privé »', () => {
        it('refuses, a folder stays in its space', async () => {
            const restaurants = ctx.givenFolderOf(AS_A, 'Restaurants');
            const cadeaux = ctx.givenPrivateFolderOf(AS_A, 'Cadeaux');
            await expect(
                move(AS_A, restaurants, cadeaux),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_MOVE_INVALID,
            });
            expect(ctx.folderRepository.persistedEvents).toEqual([]);
        });
    });

    describe('Scenario: R15, a folder moves into itself or one of its sub-folders', () => {
        it.each([
            ['itself', 0],
            ['its child', 1],
            ['its grandchild', 2],
        ])('refuses a move into %s', async (_label, depth) => {
            const sorties = ctx.givenFolderOf(AS_A, 'Sorties');
            const restaurants = ctx.givenFolderOf(AS_A, 'Restaurants', sorties);
            const italiens = ctx.givenFolderOf(AS_A, 'Italiens', restaurants);
            const targets = [sorties, restaurants, italiens];
            await expect(
                move(AS_A, sorties, targets[depth] ?? null),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_MOVE_INVALID,
            });
        });
    });

    describe('Scenario: R14, into a folder of the other partner’s « Privé »', () => {
        it('answers not found for the target', async () => {
            const mine = ctx.givenPrivateFolderOf(AS_B, 'Mes idées');
            const hers = ctx.givenPrivateFolderOf(AS_A, 'Cadeaux');
            await expect(move(AS_B, mine, hers)).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
            });
        });
    });
});
