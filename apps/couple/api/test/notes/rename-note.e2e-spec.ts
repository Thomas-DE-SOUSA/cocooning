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

describe('Feature: a partner renames a note (R6)', () => {
    const notes = new NotesTestApp();

    beforeAll(() => notes.start());
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    it('answers 200 when the other partner renames a shared note', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Courses');
        notes.advanceMinutes(1);
        expect(
            await notes.rename(PARTNER_B, noteId, 'Courses du samedi'),
        ).toEqual({
            status: 200,
            body: {
                noteId,
                ownerId: PARTNER_A,
                title: 'Courses du samedi',
                visibility: 'SHARED',
                updatedAt: new Date(NOW.getTime() + 60_000).toISOString(),
            },
        });
    });

    it('answers 404 for the private note of the other partner (R4)', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Idées cadeaux');
        await notes.makePrivate(PARTNER_A, noteId);
        expect(await notes.rename(PARTNER_B, noteId, 'Volé')).toEqual(
            NOT_FOUND,
        );
    });

    it('answers 404 to another couple and for an unknown note', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Courses');
        expect(await notes.rename(STRANGER, noteId, 'Volé')).toEqual(NOT_FOUND);
        expect(await notes.rename(PARTNER_A, UNKNOWN_NOTE_ID, 'Volé')).toEqual(
            NOT_FOUND,
        );
    });

    it('refuses an identifier that is not a UUID and an empty title with 422', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Courses');
        expect(
            (await notes.rename(PARTNER_A, 'not-a-uuid', 'Liste')).status,
        ).toBe(422);
        expect((await notes.rename(PARTNER_A, noteId, ' ')).status).toBe(422);
    });
});
