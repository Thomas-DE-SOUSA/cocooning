import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    type NoteSpace,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { FolderCreatedEvent } from '../../domain/events/folder-created.event';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    COUPLE_ID,
    NOW,
    NotesTestContext,
    PARTNER_A,
} from '../../__tests__/fixtures/notes-test.context';

const FIRST_ID = '00000000-0000-7000-8000-000000000001';
const SECOND_ID = '00000000-0000-7000-8000-000000000002';

describe('Feature: create a folder (R13, R14)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const create = (
        context: typeof AS_A,
        name: string,
        space: NoteSpace = NoteSpaceEnum.SHARED,
        parentFolderId: string | null = null,
    ) =>
        ctx
            .createFolderUseCase()
            .execute(context, { space, parentFolderId, name });

    describe('Scenario: R13, a partner creates a folder at the root of « Partagé »', () => {
        it('returns the folder, its name trimmed', async () => {
            await expect(create(AS_A, ' Restaurants ')).resolves.toEqual({
                folderId: FIRST_ID,
                space: NoteSpaceEnum.SHARED,
                parentFolderId: null,
                name: 'Restaurants',
                updatedAt: NOW,
            });
        });

        it('stores it at version 1, and persists then publishes one event without the name', async () => {
            await create(AS_A, 'Restaurants');
            expect(ctx.folderRepository.storedSnapshots).toEqual([
                {
                    id: FIRST_ID,
                    coupleId: COUPLE_ID,
                    ownerId: PARTNER_A,
                    space: NoteSpaceEnum.SHARED,
                    parentFolderId: null,
                    name: 'Restaurants',
                    version: 1,
                    metadata: {
                        createdAt: NOW.toISOString(),
                        updatedAt: NOW.toISOString(),
                        deletedAt: null,
                    },
                },
            ]);
            const expected = {
                eventId: SECOND_ID,
                eventName: FolderCreatedEvent.EVENT_NAME,
                aggregateId: FIRST_ID,
                context: AS_A,
                data: {
                    ownerId: PARTNER_A,
                    space: NoteSpaceEnum.SHARED,
                    parentFolderId: null,
                },
                occurredAt: NOW,
            };
            expect(ctx.folderRepository.persistedEvents).toEqual([expected]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
            expect(JSON.stringify(ctx.eventPublisher.published)).not.toContain(
                'Restaurants',
            );
        });
    });

    describe('Scenario: R13, R14, the other partner creates a sub-folder of a shared folder', () => {
        it('puts it under its parent', async () => {
            const parent = ctx.givenFolderOf(AS_A, 'Restaurants');
            const view = await create(
                AS_B,
                'Italiens',
                NoteSpaceEnum.SHARED,
                parent.id.getValue(),
            );
            expect(view.parentFolderId).toBe(parent.id.getValue());
        });
    });

    describe('Scenario: R14, a partner creates a folder in « Privé »', () => {
        it('keeps it in the private space', async () => {
            const view = await create(AS_A, 'Cadeaux', NoteSpaceEnum.PRIVATE);
            expect(view.space).toBe(NoteSpaceEnum.PRIVATE);
        });
    });

    describe('Scenario: R14, under a folder of the other partner’s « Privé »', () => {
        it('answers not found and stores nothing', async () => {
            const parent = ctx.givenPrivateFolderOf(AS_A, 'Cadeaux');
            await expect(
                create(
                    AS_B,
                    'Noël',
                    NoteSpaceEnum.PRIVATE,
                    parent.id.getValue(),
                ),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
            });
            expect(ctx.folderRepository.storedSnapshots).toHaveLength(1);
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: R15, under a folder of the other space', () => {
        it('refuses the mismatch', async () => {
            const parent = ctx.givenFolderOf(AS_A, 'Restaurants');
            await expect(
                create(
                    AS_A,
                    'Cadeaux',
                    NoteSpaceEnum.PRIVATE,
                    parent.id.getValue(),
                ),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_SPACE_MISMATCH,
            });
        });
    });

    describe('Scenario: under a folder of another couple (core.md rule 27)', () => {
        it('answers not found', async () => {
            const parent = ctx.givenFolderOf(AS_A, 'Restaurants');
            await expect(
                create(
                    AS_STRANGER,
                    'Autre',
                    NoteSpaceEnum.SHARED,
                    parent.id.getValue(),
                ),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
            });
        });
    });

    describe('Scenario: R13, an invalid name', () => {
        it('refuses it and stores nothing', async () => {
            await expect(create(AS_A, '  ')).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_NAME_INVALID,
            });
            expect(ctx.folderRepository.storedSnapshots).toEqual([]);
            expect(ctx.folderRepository.persistedEvents).toEqual([]);
        });
    });
});
