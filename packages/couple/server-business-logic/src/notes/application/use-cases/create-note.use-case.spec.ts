import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    NoteSpaceEnum,
    NoteVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { NoteCreatedEvent } from '../../domain/events/note-created.event';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    COUPLE_ID,
    NOW,
    NotesTestContext,
    PARTNER_A,
} from '../../__tests__/fixtures/notes-test.context';

const NOTE_ID = '00000000-0000-7000-8000-000000000001';

describe('Feature: create a note', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const create = (title: string) =>
        ctx.createNoteUseCase().execute(AS_A, {
            title,
            space: NoteSpaceEnum.SHARED,
            folderId: null,
        });

    describe('Scenario: R1, R2, a partner creates a note', () => {
        it('returns the note, shared and owned by its creator', async () => {
            await expect(create(' Courses ')).resolves.toEqual({
                noteId: NOTE_ID,
                ownerId: PARTNER_A,
                isOwner: true,
                title: 'Courses',
                visibility: NoteVisibilityEnum.SHARED,
                folderId: null,
                updatedAt: NOW,
            });
        });

        it('stores the note in its couple, at version 1', async () => {
            await create('Courses');
            expect(ctx.noteRepository.storedSnapshots).toEqual([
                {
                    id: NOTE_ID,
                    coupleId: COUPLE_ID,
                    ownerId: PARTNER_A,
                    title: 'Courses',
                    visibility: NoteVisibilityEnum.SHARED,
                    folderId: null,
                    listKind: null,
                    emoji: null,
                    openItemCount: 0,
                    version: 1,
                    metadata: {
                        createdAt: NOW.toISOString(),
                        updatedAt: NOW.toISOString(),
                        deletedAt: null,
                    },
                },
            ]);
        });

        it('persists then publishes one created event, without the title', async () => {
            await create('Courses');
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000002',
                eventName: NoteCreatedEvent.EVENT_NAME,
                aggregateId: NOTE_ID,
                context: AS_A,
                data: {
                    ownerId: PARTNER_A,
                    visibility: NoteVisibilityEnum.SHARED,
                },
                occurredAt: NOW,
            };
            expect(ctx.noteRepository.persistedEvents).toEqual([expected]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
            expect(JSON.stringify(ctx.eventPublisher.published)).not.toContain(
                'Courses',
            );
        });
    });

    describe('Scenario: R8, an invalid title', () => {
        it('refuses it and stores nothing', async () => {
            await expect(create('   ')).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_TITLE_INVALID,
            });
            expect(ctx.noteRepository.storedSnapshots).toEqual([]);
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: the in-process publication fails', () => {
        it('keeps the note and its event, and logs one warning', async () => {
            ctx.eventPublisher.failWith(new Error('bus down'));
            await create('Courses');
            expect(ctx.noteRepository.storedSnapshots).toHaveLength(1);
            expect(ctx.noteRepository.persistedEvents).toHaveLength(1);
            expect(ctx.logger.entries.map(({ level }) => level)).toEqual([
                'warn',
            ]);
        });
    });

    describe('Scenario: R11, R13, a note created in a folder of « Privé »', () => {
        it('is private and in that folder, and notifies nobody (R9)', async () => {
            const folder = ctx.givenPrivateFolderOf(AS_A, 'Cadeaux');
            const view = await ctx.createNoteUseCase().execute(AS_A, {
                title: 'Montre',
                space: NoteSpaceEnum.PRIVATE,
                folderId: folder.id.getValue(),
            });
            expect(view).toMatchObject({
                visibility: NoteVisibilityEnum.PRIVATE,
                folderId: folder.id.getValue(),
            });
            expect(ctx.eventPublisher.published[0]?.data).toEqual({
                ownerId: PARTNER_A,
                visibility: NoteVisibilityEnum.PRIVATE,
            });
        });
    });

    describe('Scenario: R14, in a folder the partner does not see', () => {
        it('answers not found and stores nothing', async () => {
            const folder = ctx.givenPrivateFolderOf(AS_B, 'Surprise');
            await expect(
                ctx.createNoteUseCase().execute(AS_A, {
                    title: 'Montre',
                    space: NoteSpaceEnum.PRIVATE,
                    folderId: folder.id.getValue(),
                }),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
            });
            expect(ctx.noteRepository.storedSnapshots).toEqual([]);
        });
    });
});
