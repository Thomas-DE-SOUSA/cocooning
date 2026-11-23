import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NotesTestApp } from './notes-test-app';
import {
    NOW,
    PARTNER_A,
    PARTNER_B,
    refusal,
    STRANGER,
    UNKNOWN_NOTE_ID,
} from './notes-test-data';

const NOT_FOUND = refusal(
    404,
    NoteExceptionCodeEnum.NOTE_NOT_FOUND,
    'Note not found',
);

describe('Feature: a partner opens a note (R4)', () => {
    const notes = new NotesTestApp();

    beforeAll(() => notes.start());
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    it('answers 200 with the shared note to the other partner', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Courses');
        expect(await notes.get(PARTNER_B, noteId)).toEqual({
            status: 200,
            body: {
                noteId,
                ownerId: PARTNER_A,
                isOwner: false,
                title: 'Courses',
                visibility: 'SHARED',
                updatedAt: NOW.toISOString(),
            },
        });
    });

    it('answers 404 for the private note of the other partner', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Idées cadeaux');
        await notes.makePrivate(PARTNER_A, noteId);
        expect(await notes.get(PARTNER_B, noteId)).toEqual(NOT_FOUND);
        expect((await notes.get(PARTNER_A, noteId)).status).toBe(200);
    });

    it('answers 404 to another couple and for an unknown note (core.md rule 27)', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Courses');
        expect(await notes.get(STRANGER, noteId)).toEqual(NOT_FOUND);
        expect(await notes.get(PARTNER_A, UNKNOWN_NOTE_ID)).toEqual(NOT_FOUND);
    });

    it('refuses an identifier that is not a UUID with 422', async () => {
        expect((await notes.get(PARTNER_A, 'abc')).status).toBe(422);
    });
});
