import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { readNoteEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { NoteCreatedEvent } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { NotesTestApp } from './notes-test-app';
import {
    ALONE,
    COUPLE_ID,
    NOTES_SESSION_MISSING,
    noteOf,
    NOW,
    PARTNER_A,
    refusal,
} from './notes-test-data';

describe('Feature: a partner creates a note (R1, R2)', () => {
    const notes = new NotesTestApp();

    beforeAll(() => notes.start());
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    describe('Scenario: a partner of a formed couple', () => {
        it('answers 201 with the note, shared and owned by its creator', async () => {
            const response = await notes.create(PARTNER_A, '  Courses ');
            expect(response).toEqual({
                status: 201,
                body: {
                    noteId: noteOf(response).noteId,
                    ownerId: PARTNER_A,
                    isOwner: true,
                    title: 'Courses',
                    visibility: 'SHARED',
                    folderId: null,
                    updatedAt: NOW.toISOString(),
                },
            });
        });

        it('writes its outbox row, without the title', async () => {
            const noteId = await notes.createdNoteId(PARTNER_A, 'Courses');
            const events = await readNoteEvents(notes.prisma, noteId);
            expect(events).toEqual([
                {
                    eventName: NoteCreatedEvent.EVENT_NAME,
                    coupleId: COUPLE_ID,
                    aggregateId: noteId,
                    userId: PARTNER_A,
                    version: 1,
                    published: false,
                    eventData: { ownerId: PARTNER_A, visibility: 'SHARED' },
                },
            ]);
        });
    });

    describe('Scenario: R8, an invalid title', () => {
        it('refuses with 422', async () => {
            const response = await notes.create(PARTNER_A, '   ');
            expect(response.status).toBe(422);
        });
    });

    describe('Scenario: R3, a partner without a formed couple', () => {
        it('refuses with 404 NOTE_COUPLE_NOT_PAIRED', async () => {
            expect(await notes.create(ALONE, 'Courses')).toEqual(
                refusal(
                    404,
                    NoteExceptionCodeEnum.NOTE_COUPLE_NOT_PAIRED,
                    'Notes need a formed couple',
                ),
            );
        });
    });

    describe('Scenario: no session cookie', () => {
        it('refuses with 401', async () => {
            const response = await notes
                .unauthenticated()
                .post(ApiRouterEnum.NOTE_CREATE, { title: 'Courses' });
            expect(response).toEqual(NOTES_SESSION_MISSING);
        });
    });
});
