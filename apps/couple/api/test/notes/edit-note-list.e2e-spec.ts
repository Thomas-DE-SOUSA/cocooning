import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { readNoteEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { NoteListEditedEvent } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ListRequests } from './list-requests';
import { NotesTestApp } from './notes-test-app';
import {
    COUPLE_ID,
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

describe('Feature: a partner changes the title and the emoji of a list (R6, R26)', () => {
    const notes = new NotesTestApp();
    const lists = new ListRequests((userId) => notes.as(userId));

    beforeAll(() => notes.start());
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    it('answers 200 when the other partner edits a shared list, and records one event', async () => {
        const noteId = await lists.createdListId(PARTNER_A, 'Carrefour');
        notes.advanceMinutes(1);
        expect(await lists.edit(PARTNER_B, noteId, 'Lidl', '🥖')).toEqual({
            status: 200,
            body: {
                noteId,
                title: 'Lidl',
                emoji: '🥖',
                visibility: 'SHARED',
                isOwner: false,
                openItemCount: 0,
                updatedAt: new Date(NOW.getTime() + 60_000).toISOString(),
            },
        });
        const events = await readNoteEvents(notes.prisma, noteId);
        expect(events[1]).toEqual({
            eventName: NoteListEditedEvent.EVENT_NAME,
            coupleId: COUPLE_ID,
            aggregateId: noteId,
            userId: PARTNER_B,
            version: 2,
            published: false,
            eventData: null,
        });
    });

    it('removes the emoji with null', async () => {
        const noteId = await lists.createdListId(PARTNER_A, 'Carrefour');
        const response = await lists.edit(PARTNER_A, noteId, 'Carrefour', null);
        expect(response.body).toMatchObject({ emoji: null });
    });

    it('answers 404 for the private list of the other partner (R4), another couple and an unknown note', async () => {
        const noteId = await lists.createdListId(
            PARTNER_A,
            'Pharmacie',
            'PRIVATE',
        );
        expect(await lists.edit(PARTNER_B, noteId, 'Volé', null)).toEqual(
            NOT_FOUND,
        );
        expect(await lists.edit(STRANGER, noteId, 'Volé', null)).toEqual(
            NOT_FOUND,
        );
        expect(
            await lists.edit(PARTNER_A, UNKNOWN_NOTE_ID, 'Volé', null),
        ).toEqual(NOT_FOUND);
    });

    it('answers 404 NOTE_LIST_NOT_FOUND for an ordinary note', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Idées');
        expect(await lists.edit(PARTNER_A, noteId, 'Lidl', null)).toEqual(
            refusal(
                404,
                NoteExceptionCodeEnum.NOTE_LIST_NOT_FOUND,
                'The note is not a list',
            ),
        );
    });

    it('refuses an empty emoji, a missing emoji and an identifier that is not a UUID with 422', async () => {
        const noteId = await lists.createdListId(PARTNER_A, 'Carrefour');
        expect((await lists.edit(PARTNER_A, noteId, 'Lidl', ' ')).status).toBe(
            422,
        );
        expect(
            (
                await notes
                    .as(PARTNER_A)
                    .patch(
                        ApiRouterEnum.NOTE_LIST_EDIT.replace(':noteId', noteId),
                        { title: 'Lidl' },
                    )
            ).status,
        ).toBe(422);
        expect(
            (await lists.edit(PARTNER_A, 'not-a-uuid', 'Lidl', null)).status,
        ).toBe(422);
    });
});
