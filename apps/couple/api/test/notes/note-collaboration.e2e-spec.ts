import { setTimeout as delay } from 'node:timers/promises';
import { openEditor } from './collaboration-editor';
import { NotesTestApp } from './notes-test-app';
import { PARTNER_A, PARTNER_B, STRANGER } from './notes-test-data';
import { partnerSessionToken } from '../shared/app/session-token';

const POLL_MS = 50;
const POLL_ATTEMPTS = 60;

describe('Feature: two partners edit a note in real time (R6, decision 0040)', () => {
    const notes = new NotesTestApp();
    let url: string;

    beforeAll(async () => {
        await notes.start();
        url = await notes.collaborationUrl();
    });
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    const as = (userId: string) =>
        partnerSessionToken(userId, notes.clock.now());

    // The channel stores after a short debounce: read again until the content lands.
    const storedContent = async (
        noteId: string,
        attemptsLeft = POLL_ATTEMPTS,
    ): Promise<Uint8Array | null> => {
        const row = await notes.prisma.includingDeleted.note.findFirst({
            where: { id: noteId },
            select: { contentState: true },
        });
        const content = row === null ? null : row.contentState;
        if (content !== null || attemptsLeft === 0) return content;
        await delay(POLL_MS);
        return storedContent(noteId, attemptsLeft - 1);
    };

    it('stores what one partner writes and gives it to the other', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Courses');
        const writer = await openEditor(url, noteId, as(PARTNER_A));
        writer.write('Lait, oeufs');
        writer.close();
        expect(await storedContent(noteId)).not.toBeNull();
        const reader = await openEditor(url, noteId, as(PARTNER_B));
        expect(reader.text()).toBe('Lait, oeufs');
        reader.close();
    });

    it.each([
        ['the other partner on a private note', PARTNER_B],
        ['another couple', STRANGER],
    ])('refuses %s (R4)', async (_label, userId) => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Idées cadeaux');
        await notes.makePrivate(PARTNER_A, noteId);
        await expect(openEditor(url, noteId, as(userId))).rejects.toThrow(
            'Connection refused',
        );
    });

    it('refuses a connection without session', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Courses');
        await expect(openEditor(url, noteId, null)).rejects.toThrow(
            'Connection refused',
        );
    });

    it('disconnects the other partner when the owner makes the note private, not the owner (R5)', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Courses');
        const owner = await openEditor(url, noteId, as(PARTNER_A));
        const other = await openEditor(url, noteId, as(PARTNER_B));
        await notes.makePrivate(PARTNER_A, noteId);
        await expect(other.closedByServer).resolves.toBeUndefined();
        owner.write('Liste secrète');
        owner.close();
        other.close();
        expect(await storedContent(noteId)).not.toBeNull();
        const reread = await openEditor(url, noteId, as(PARTNER_A));
        expect(reread.text()).toBe('Liste secrète');
        reread.close();
    });

    it('disconnects everyone when the owner deletes the note (R7)', async () => {
        const noteId = await notes.createdNoteId(PARTNER_A, 'Courses');
        const owner = await openEditor(url, noteId, as(PARTNER_A));
        await notes.delete(PARTNER_A, noteId);
        await expect(owner.closedByServer).resolves.toBeUndefined();
        owner.close();
    });
});
