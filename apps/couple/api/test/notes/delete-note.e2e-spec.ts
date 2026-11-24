import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NotesTestApp } from './notes-test-app';
import { PARTNER_A, PARTNER_B, refusal, STRANGER } from './notes-test-data';

const NOT_FOUND = refusal(
    404,
    NoteExceptionCodeEnum.NOTE_NOT_FOUND,
    'Note not found',
);

describe('Feature: the owner deletes a note (R7)', () => {
    const notes = new NotesTestApp();

    beforeAll(() => notes.start());
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    it('answers 204, then the note is gone for both partners', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Courses');
        expect(await notes.delete(PARTNER_A, noteId)).toEqual({
            status: 204,
            body: null,
        });
        expect(await notes.delete(PARTNER_A, noteId)).toEqual(NOT_FOUND);
        expect((await notes.list(PARTNER_B)).body).toMatchObject({ total: 0 });
    });

    it('refuses the other partner with 403', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Courses');
        expect(await notes.delete(PARTNER_B, noteId)).toEqual(
            refusal(
                403,
                NoteExceptionCodeEnum.NOTE_RESERVED_TO_OWNER,
                'Reserved to the owner of the note',
            ),
        );
    });

    it('answers 404 to another couple (core.md rule 27)', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Courses');
        expect(await notes.delete(STRANGER, noteId)).toEqual(NOT_FOUND);
    });
});
