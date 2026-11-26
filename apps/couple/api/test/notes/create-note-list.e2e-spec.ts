import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { readNoteEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { NoteCreatedEvent } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { listOf, ListRequests } from './list-requests';
import { NotesTestApp } from './notes-test-app';
import {
    ALONE,
    COUPLE_ID,
    NOTES_SESSION_MISSING,
    NOW,
    PARTNER_A,
    refusal,
} from './notes-test-data';

describe('Feature: a partner creates a list of the Lists tab (R26)', () => {
    const notes = new NotesTestApp();
    const lists = new ListRequests((userId) => notes.as(userId));

    beforeAll(() => notes.start());
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    describe('Scenario: R1, R26, a shared grocery list with an emoji', () => {
        it('answers 201 with the list, nothing left to check', async () => {
            const response = await lists.create(PARTNER_A, ' Carrefour ');
            expect(response).toEqual({
                status: 201,
                body: {
                    noteId: listOf(response).noteId,
                    title: 'Carrefour',
                    emoji: '🛒',
                    visibility: 'SHARED',
                    isOwner: true,
                    openItemCount: 0,
                    updatedAt: NOW.toISOString(),
                },
            });
        });

        it('writes the created event of a note in the outbox, without the title or the emoji (R9)', async () => {
            const noteId = await lists.createdListId(PARTNER_A, 'Carrefour');
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

        it('stores the section and the emoji on the note, at the root', async () => {
            const noteId = await lists.createdListId(
                PARTNER_A,
                'Noël',
                'PRIVATE',
                'TASKS',
            );
            const row = await notes.prisma.includingDeleted.note.findFirst({
                where: { id: noteId },
                select: {
                    listKind: true,
                    emoji: true,
                    visibility: true,
                    folderId: true,
                    openItemCount: true,
                },
            });
            expect(row).toEqual({
                listKind: 'TASKS',
                emoji: '🛒',
                visibility: 'PRIVATE',
                folderId: null,
                openItemCount: 0,
            });
        });
    });

    describe('Scenario: an invalid request', () => {
        it.each([
            [
                'an unknown section',
                { kind: 'WISHES', space: 'SHARED', title: 'A' },
            ],
            ['a missing space', { kind: 'TASKS', title: 'Noël' }],
            [
                'an emoji over the limit',
                {
                    kind: 'TASKS',
                    space: 'SHARED',
                    title: 'Noël',
                    emoji: '🎄'.repeat(17),
                },
            ],
            ['an empty title', { kind: 'TASKS', space: 'SHARED', title: ' ' }],
        ])('refuses %s with 422', async (_label, body) => {
            const response = await notes
                .as(PARTNER_A)
                .post(ApiRouterEnum.NOTE_LIST_CREATE, body);
            expect(response.status).toBe(422);
        });
    });

    describe('Scenario: R3, a partner without a formed couple', () => {
        it('refuses with 404 NOTE_COUPLE_NOT_PAIRED', async () => {
            expect(await lists.create(ALONE, 'Carrefour')).toEqual(
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
                .post(ApiRouterEnum.NOTE_LIST_CREATE, {
                    kind: 'TASKS',
                    space: 'SHARED',
                    title: 'Noël',
                });
            expect(response).toEqual(NOTES_SESSION_MISSING);
        });
    });
});
