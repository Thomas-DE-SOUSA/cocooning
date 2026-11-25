import { readNoteEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { NoteCardSearchedEvent } from '@cocooning/couple-server-business-logic/notes';
import { CardRequests, noteDetailOf } from './card-requests';
import { folderOf, FolderRequests } from './folder-requests';
import { NotesTestApp } from './notes-test-app';
import { COUPLE_ID, NOW, PARTNER_A, PARTNER_B } from './notes-test-data';

const RESTAURANTS = {
    subject: 'Les restaurants que nous voulons essayer',
    cardTemplate: ['Adresse', 'Prix'],
};
const RESULT = {
    title: 'Chez Paul, bouchon lyonnais',
    url: 'https://chez-paul.example/',
    snippet: '11 rue Mercière',
};
// Winter: midnight in Paris is 23:00 UTC the day before (R23).
const PARIS_MIDNIGHT = new Date('2026-11-22T23:00:00.000Z');

describe('Feature: the background task fills the cards (R19 to R24, decision 0054)', () => {
    const notes = new NotesTestApp();
    const folders = new FolderRequests((userId) => notes.as(userId));
    const cards = new CardRequests((userId) => notes.as(userId));

    beforeAll(() => notes.start());
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    const addedCard = async () => {
        const folderId = folderOf(
            await folders.createSmart(PARTNER_A, 'Restaurants', RESTAURANTS),
        ).folderId;
        return noteDetailOf(await cards.add(PARTNER_B, folderId, 'Chez Paul'));
    };
    const cardOfNote = async (noteId: string) =>
        noteDetailOf(await notes.get(PARTNER_A, noteId)).card;
    const givenSearches = (count: number, searchedAt: Date) =>
        notes.prisma.includingDeleted.noteCardSearch.createMany({
            data: Array.from({ length: count }, () => ({
                coupleId: COUPLE_ID,
                noteCardId: COUPLE_ID,
                searchedAt,
            })),
        });

    describe('Scenario: R21, the texts give the values', () => {
        it('fills the card, counts the search, writes the outbox row', async () => {
            const { noteId, card } = await addedCard();
            notes.search.willFind([RESULT]);
            notes.pages.givenPage(
                RESULT.url,
                'Chez Paul, 11 rue Mercière, Lyon',
            );
            notes.writer.willWrite({
                kind: 'VALUES',
                values: { Adresse: '11 rue Mercière', Prix: null },
                sourceUrls: [RESULT.url],
            });
            await notes.enrichCards();
            expect(notes.search.queries).toEqual(['Chez Paul Restaurants']);
            expect(await cardOfNote(noteId)).toMatchObject({
                status: 'FILLED',
                fields: [
                    {
                        name: 'Adresse',
                        value: '11 rue Mercière',
                        isManual: false,
                    },
                    { name: 'Prix', value: null, isManual: false },
                ],
                sources: [RESULT.url],
                searchedAt: NOW.toISOString(),
            });
            expect(
                await notes.prisma.includingDeleted.noteCardSearch.count(),
            ).toBe(1);
            expect(
                (await readNoteEvents(notes.prisma, card?.noteCardId ?? '')).at(
                    -1,
                ),
            ).toMatchObject({
                eventName: NoteCardSearchedEvent.EVENT_NAME,
                userId: PARTNER_B,
                eventData: { noteId, status: 'FILLED' },
            });
        });

        it('fails the card when the AI does not answer, and the note stays (R20)', async () => {
            const { noteId } = await addedCard();
            await notes.enrichCards();
            expect((await cardOfNote(noteId))?.status).toBe('FAILED');
            expect((await notes.get(PARTNER_A, noteId)).status).toBe(200);
        });
    });

    describe('Scenario: R23, thirty searches a day of Paris', () => {
        it('stops at the limit of the day', async () => {
            const { noteId } = await addedCard();
            await givenSearches(30, PARIS_MIDNIGHT);
            await notes.enrichCards();
            expect((await cardOfNote(noteId))?.status).toBe('LIMIT_REACHED');
            expect(notes.search.queries).toEqual([]);
        });

        it('forgets the searches of the day before in Paris', async () => {
            const { noteId } = await addedCard();
            await givenSearches(30, new Date(PARIS_MIDNIGHT.getTime() - 1));
            notes.writer.willWrite({
                kind: 'VALUES',
                values: {},
                sourceUrls: [],
            });
            await notes.enrichCards();
            expect((await cardOfNote(noteId))?.status).toBe('FILLED');
        });
    });

    describe('Scenario: decision 0054, a card reserved by another pass', () => {
        it('is skipped during its reservation, then offered again', async () => {
            const { noteId } = await addedCard();
            await notes.prisma.includingDeleted.noteCard.updateMany({
                where: { noteId },
                data: { claimedAt: NOW },
            });
            notes.writer.willWrite({
                kind: 'VALUES',
                values: {},
                sourceUrls: [],
            });
            await notes.enrichCards();
            expect((await cardOfNote(noteId))?.status).toBe('PENDING');
            notes.advanceMinutes(6);
            await notes.enrichCards();
            expect((await cardOfNote(noteId))?.status).toBe('FILLED');
        });
    });
});
