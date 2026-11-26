import { setTimeout as delay } from 'node:timers/promises';
import { openEditor } from './collaboration-editor';
import { ListRequests } from './list-requests';
import { NotesTestApp } from './notes-test-app';
import { PARTNER_A, PARTNER_B } from './notes-test-data';
import { partnerSessionToken } from '../shared/app/session-token';

const POLL_MS = 50;
const POLL_ATTEMPTS = 60;

describe('Feature: the home says what is left to check in a list written in real time (R28)', () => {
    const notes = new NotesTestApp();
    const lists = new ListRequests((userId) => notes.as(userId));
    let url: string;

    beforeAll(async () => {
        await notes.start();
        url = await notes.collaborationUrl();
    });
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    const as = (userId: string) =>
        partnerSessionToken(userId, notes.clock.now());

    // The channel stores after a short debounce: read again until the count lands.
    const storedCount = async (
        noteId: string,
        expected: number,
        attemptsLeft = POLL_ATTEMPTS,
    ): Promise<number | null> => {
        const row = await notes.prisma.includingDeleted.note.findFirst({
            where: { id: noteId },
            select: { openItemCount: true },
        });
        const count = row === null ? null : row.openItemCount;
        if (count === expected || attemptsLeft === 0) return count;
        await delay(POLL_MS);
        return storedCount(noteId, expected, attemptsLeft - 1);
    };

    it('counts the lines one partner leaves unchecked, and the other sees the count', async () => {
        const noteId = await lists.createdListId(PARTNER_A, 'Carrefour');
        const writer = await openEditor(url, noteId, as(PARTNER_A));
        writer.writeTaskList([false, true, false]);
        writer.close();
        expect(await storedCount(noteId, 2)).toBe(2);
        expect((await lists.index(PARTNER_B, 'GROCERIES')).body).toMatchObject({
            items: [{ noteId, openItemCount: 2 }],
        });
    });

    it('still saves an ordinary note written in real time', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Idées');
        const writer = await openEditor(url, noteId, as(PARTNER_A));
        writer.write('Un voyage');
        writer.writeTaskList([false]);
        writer.close();
        expect(await storedCount(noteId, 1)).toBe(1);
        const reader = await openEditor(url, noteId, as(PARTNER_B));
        expect(reader.text()).toBe('Un voyage');
        reader.close();
    });
});
