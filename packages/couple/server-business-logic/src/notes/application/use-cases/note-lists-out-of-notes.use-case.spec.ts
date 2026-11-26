import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    NoteListKindEnum,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import type { Note } from '../../domain/models/note.aggregate';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';

describe('Feature: the lists live in the Lists tab, not in the notes (R27)', () => {
    let ctx: NotesTestContext;
    let ordinary: Note;
    let list: Note;

    beforeEach(() => {
        ctx = new NotesTestContext();
        ordinary = ctx.givenNoteOf(AS_A, 'Idées');
        list = ctx.givenListOf(AS_A);
        ctx.givenListOf(
            AS_A,
            'Cadeaux',
            NoteListKindEnum.TASKS,
            NoteSpaceEnum.PRIVATE,
        );
    });
    afterEach(() => NoteId.resetForTests());

    describe('Scenario: R27, the notes home', () => {
        it('leaves the lists out of « Modifiées récemment »', async () => {
            await expect(
                ctx.listNotesUseCase().execute(AS_A, { page: 1, pageSize: 25 }),
            ).resolves.toMatchObject({
                items: [{ noteId: ordinary.id.getValue() }],
                total: 1,
            });
        });

        it('counts no list in « Partagé » or « Privé »', async () => {
            await expect(
                ctx.listNoteSpacesUseCase().execute(AS_A),
            ).resolves.toEqual({
                spaces: [
                    {
                        space: NoteSpaceEnum.SHARED,
                        folderCount: 0,
                        noteCount: 1,
                    },
                    {
                        space: NoteSpaceEnum.PRIVATE,
                        folderCount: 0,
                        noteCount: 0,
                    },
                ],
            });
        });

        it('shows no list at the root of a space', async () => {
            const contents = await ctx
                .getNoteSpaceContentsUseCase()
                .execute(AS_A, { space: NoteSpaceEnum.SHARED, folderId: null });
            expect(contents.notes.map(({ noteId }) => noteId)).toEqual([
                ordinary.id.getValue(),
            ]);
        });
    });

    describe('Scenario: R26, a list opens like any note', () => {
        it('gives the note with its section and emoji to the other partner', async () => {
            await expect(
                ctx
                    .getNoteUseCase()
                    .execute(AS_B, { noteId: list.id.getValue() }),
            ).resolves.toMatchObject({
                title: 'Carrefour',
                listKind: NoteListKindEnum.GROCERIES,
                emoji: '🛒',
                card: null,
            });
        });
    });

    describe('Scenario: R27, filing a list into a folder', () => {
        it('refuses it, and changes nothing', async () => {
            const folder = ctx.givenFolderOf(AS_A, 'Maison');
            await expect(
                ctx.moveNoteUseCase().execute(AS_B, {
                    noteId: list.id.getValue(),
                    space: NoteSpaceEnum.SHARED,
                    folderId: folder.id.getValue(),
                }),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_LIST_NOT_MOVABLE,
            });
            expect(ctx.noteRepository.persistedEvents).toEqual([]);
        });
    });
});
