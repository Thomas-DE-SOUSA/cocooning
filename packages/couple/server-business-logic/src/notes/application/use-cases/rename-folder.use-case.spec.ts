import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    FolderKindEnum,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { FolderRenamedEvent } from '../../domain/events/folder-renamed.event';
import { Folder } from '../../domain/models/folder.aggregate';
import { FolderName } from '../../domain/value-objects/folder-name.vo';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    MILLISECONDS_PER_HOUR,
    NOW,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';

const RENAMED_AT = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);

describe('Feature: rename a folder (R13, R14)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const rename = (context: typeof AS_A, folder: Folder, name: string) =>
        ctx
            .renameFolderUseCase()
            .execute(context, { folderId: folder.id.getValue(), name });

    describe('Scenario: R14, the other partner renames a shared folder', () => {
        it('returns the renamed folder, stores it and records one event', async () => {
            const folder = ctx.givenFolderOf(AS_A, 'Restaurants');
            ctx.advanceHours(1);
            await expect(
                rename(AS_B, folder, ' Bonnes tables '),
            ).resolves.toEqual({
                folderId: folder.id.getValue(),
                space: NoteSpaceEnum.SHARED,
                kind: FolderKindEnum.CLASSIC,
                parentFolderId: null,
                name: 'Bonnes tables',
                subject: null,
                cardTemplate: null,
                updatedAt: RENAMED_AT,
            });
            expect(ctx.folderRepository.storedSnapshots[0]).toMatchObject({
                name: 'Bonnes tables',
                version: 2,
                metadata: { updatedAt: RENAMED_AT.toISOString() },
            });
            const expected = {
                eventId: expect.stringMatching(/^00000000-0000-7000-8000-/),
                eventName: FolderRenamedEvent.EVENT_NAME,
                aggregateId: folder.id.getValue(),
                context: AS_B,
                data: null,
                occurredAt: RENAMED_AT,
            };
            expect(ctx.folderRepository.persistedEvents).toEqual([expected]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
        });
    });

    describe('Scenario: R14, a folder of the other partner’s « Privé »', () => {
        it('answers not found', async () => {
            const folder = ctx.givenPrivateFolderOf(AS_A, 'Cadeaux');
            await expect(rename(AS_B, folder, 'Noël')).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
            });
            expect(ctx.folderRepository.persistedEvents).toEqual([]);
        });
    });

    describe('Scenario: a folder of another couple (core.md rule 27)', () => {
        it('answers not found', async () => {
            const folder = ctx.givenFolderOf(AS_A, 'Restaurants');
            await expect(
                rename(AS_STRANGER, folder, 'Autre'),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
            });
        });
    });

    describe('Scenario: R13, an invalid name', () => {
        it('refuses it and changes nothing', async () => {
            const folder = ctx.givenFolderOf(AS_A, 'Restaurants');
            await expect(
                rename(AS_A, folder, 'a'.repeat(61)),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_NAME_INVALID,
            });
            expect(ctx.folderRepository.storedSnapshots[0]).toMatchObject({
                name: 'Restaurants',
                version: 1,
            });
        });
    });

    describe('Scenario: the other partner saved the folder in between', () => {
        it('refuses with a version conflict and publishes nothing', async () => {
            const folder = ctx.givenFolderOf(AS_A, 'Restaurants');
            const concurrent = Folder.fromSnapshot(folder.toSnapshot());
            concurrent.rename(AS_B.userId, FolderName.create('Tables'), NOW);
            ctx.folderRepository.simulateConcurrentSave(concurrent);
            await expect(rename(AS_A, folder, 'Tables')).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_VERSION_CONFLICT,
            });
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });
});
