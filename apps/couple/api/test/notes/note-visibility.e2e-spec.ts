import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { readNoteEvents } from '@cocooning/couple-e2e-shared/fixtures';
import {
    NoteMadePrivateEvent,
    NoteSharedEvent,
} from '@cocooning/couple-server-business-logic/notes';
import { NotesTestApp } from './notes-test-app';
import { PARTNER_A, PARTNER_B, refusal } from './notes-test-data';

const RESERVED = refusal(
    403,
    NoteExceptionCodeEnum.NOTE_RESERVED_TO_OWNER,
    'Reserved to the owner of the note',
);

describe('Feature: the owner changes the visibility of a note (R5)', () => {
    const notes = new NotesTestApp();

    beforeAll(() => notes.start());
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    it('makes a note private, then shares it again, with one outbox row each', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Courses');
        const madePrivate = await notes.makePrivate(PARTNER_A, noteId);
        expect(madePrivate.status).toBe(200);
        expect(madePrivate.body).toMatchObject({ visibility: 'PRIVATE' });
        const shared = await notes.share(PARTNER_A, noteId);
        expect(shared.body).toMatchObject({ visibility: 'SHARED' });
        const events = await readNoteEvents(notes.prisma, noteId);
        expect(events.map(({ eventName }) => eventName).slice(1)).toEqual([
            NoteMadePrivateEvent.EVENT_NAME,
            NoteSharedEvent.EVENT_NAME,
        ]);
    });

    it('refuses the other partner with 403 on a shared note', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Courses');
        expect(await notes.makePrivate(PARTNER_B, noteId)).toEqual(RESERVED);
        expect(await notes.share(PARTNER_B, noteId)).toEqual(RESERVED);
    });

    it('answers 404 to the other partner on a private note (R4)', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Idées cadeaux');
        await notes.makePrivate(PARTNER_A, noteId);
        expect((await notes.share(PARTNER_B, noteId)).status).toBe(404);
    });
});
