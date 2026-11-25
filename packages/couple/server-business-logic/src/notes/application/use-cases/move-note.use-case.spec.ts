import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    type NoteSpace,
    NoteSpaceEnum,
    NoteVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { NoteMadePrivateEvent } from '../../domain/events/note-made-private.event';
import { NoteMovedEvent } from '../../domain/events/note-moved.event';
import { NoteSharedEvent } from '../../domain/events/note-shared.event';
import type { Folder } from '../../domain/models/folder.aggregate';
import type { Note } from '../../domain/models/note.aggregate';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    MILLISECONDS_PER_HOUR,
    NOW,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';

const MOVED_AT = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);

describe('Feature: move a note (R11)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const move = (
        context: typeof AS_A,
        note: Note,
        space: NoteSpace,
        folder: Folder | null,
    ) =>
        ctx.moveNoteUseCase().execute(context, {
            noteId: note.id.getValue(),
            space,
            folderId: folder === null ? null : folder.id.getValue(),
        });

    const eventNames = () =>
        ctx.noteRepository.persistedEvents.map(({ eventName }) => eventName);

    describe('Scenario: R11, the other partner files a shared note in a shared folder', () => {
        it('changes its folder only, and records one event', async () => {
            const note = ctx.givenNoteOf(AS_A);
            const folder = ctx.givenFolderOf(AS_A, 'Maison');
            ctx.advanceHours(1);
            const view = await move(AS_B, note, NoteSpaceEnum.SHARED, folder);
            expect(view).toMatchObject({
                visibility: NoteVisibilityEnum.SHARED,
                folderId: folder.id.getValue(),
                updatedAt: MOVED_AT,
            });
            const expected = {
                eventId: expect.stringMatching(/^00000000-0000-7000-8000-/),
                eventName: NoteMovedEvent.EVENT_NAME,
                aggregateId: note.id.getValue(),
                context: AS_B,
                data: { folderId: folder.id.getValue() },
                occurredAt: MOVED_AT,
            };
            expect(ctx.noteRepository.persistedEvents).toEqual([expected]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
            expect(ctx.noteCollaborationProvider.disconnections).toEqual([]);
        });
    });

    describe('Scenario: R11, the owner moves her shared note into « Privé »', () => {
        it('makes it private and disconnects the other editor', async () => {
            const note = ctx.givenNoteOf(AS_A);
            const folder = ctx.givenPrivateFolderOf(AS_A, 'Cadeaux');
            const view = await move(AS_A, note, NoteSpaceEnum.PRIVATE, folder);
            expect(view).toMatchObject({
                visibility: NoteVisibilityEnum.PRIVATE,
                folderId: folder.id.getValue(),
            });
            expect(eventNames()).toEqual([
                NoteMadePrivateEvent.EVENT_NAME,
                NoteMovedEvent.EVENT_NAME,
            ]);
            expect(ctx.noteCollaborationProvider.disconnections).toEqual([
                { noteId: note.id.getValue(), keptUserId: AS_A.userId },
            ]);
        });
    });

    describe('Scenario: R9, R11, the owner moves her private note to the root of « Partagé »', () => {
        it('shares it, which notifies the other partner', async () => {
            const note = ctx.givenPrivateNoteOf(AS_A);
            const view = await move(AS_A, note, NoteSpaceEnum.SHARED, null);
            expect(view).toMatchObject({
                visibility: NoteVisibilityEnum.SHARED,
                folderId: null,
            });
            expect(eventNames()).toEqual([
                NoteSharedEvent.EVENT_NAME,
                NoteMovedEvent.EVENT_NAME,
            ]);
        });
    });

    describe('Scenario: R5, R11, the other partner files the owner’s note in her own « Privé »', () => {
        it('refuses, reserved to the owner, and changes nothing', async () => {
            const note = ctx.givenNoteOf(AS_A);
            await expect(
                move(AS_B, note, NoteSpaceEnum.PRIVATE, null),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_RESERVED_TO_OWNER,
            });
            expect(ctx.noteRepository.persistedEvents).toEqual([]);
            expect(ctx.noteCollaborationProvider.disconnections).toEqual([]);
        });
    });

    describe('Scenario: a folder that does not match the space named', () => {
        it('refuses the mismatch', async () => {
            const note = ctx.givenNoteOf(AS_A);
            const folder = ctx.givenFolderOf(AS_A, 'Maison');
            await expect(
                move(AS_A, note, NoteSpaceEnum.PRIVATE, folder),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_SPACE_MISMATCH,
            });
        });
    });

    describe('Scenario: R4, R14, what the partner does not see', () => {
        it('answers not found for the other partner’s private note or folder', async () => {
            const privateNote = ctx.givenPrivateNoteOf(AS_A);
            const privateFolder = ctx.givenPrivateFolderOf(AS_A, 'Cadeaux');
            const shared = ctx.givenNoteOf(AS_B, 'Vacances');
            await expect(
                move(AS_B, privateNote, NoteSpaceEnum.PRIVATE, null),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_NOT_FOUND,
            });
            await expect(
                move(AS_B, shared, NoteSpaceEnum.PRIVATE, privateFolder),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
            });
        });
    });
});
