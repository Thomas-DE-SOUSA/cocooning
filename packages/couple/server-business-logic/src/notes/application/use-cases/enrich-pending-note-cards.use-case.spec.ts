import {
    NoteCardStatusEnum,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { NoteCardSearchedEvent } from '../../domain/events/note-card-searched.event';
import type { Note } from '../../domain/models/note.aggregate';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    COUPLE_ID,
    DAILY_SEARCH_LIMIT,
    NOW,
    NotesTestContext,
    PARTNER_B,
} from '../../__tests__/fixtures/notes-test.context';
import { PROPOSED_TEMPLATE } from '../../__tests__/secondary/adapters/fake-note-card.writer';

const RESULTS = ['a', 'b', 'c', 'd'].map((name) => ({
    title: `Chez Paul ${name}`,
    url: `https://${name}.example/`,
    snippet: `Bouchon ${name}`,
}));
const VALUES = { Adresse: '11 rue Mercière', Cuisine: 'Lyonnaise', Prix: null };

describe('Feature: the background task fills the cards « en recherche » (R19 to R24)', () => {
    let ctx: NotesTestContext;
    let lyon: ReturnType<NotesTestContext['givenSmartFolderOf']>;
    let chezPaul: Note;

    beforeEach(() => {
        ctx = new NotesTestContext();
        const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
        lyon = ctx.givenSmartFolderOf(AS_A, 'Lyon', restaurants);
        chezPaul = ctx.givenNoteOf(AS_B, 'Chez Paul', lyon);
        ctx.webSearchProvider.willFind(RESULTS);
        ctx.webPageReader.givenPage(
            'https://a.example/',
            'Chez Paul, 11 rue Mercière',
        );
        ctx.webPageReader.givenPage('https://c.example/', 'Cuisine lyonnaise');
    });
    afterEach(() => NoteId.resetForTests());

    const enrich = () => ctx.enrichPendingNoteCardsUseCase().execute();
    const stored = (note: Note) =>
        ctx.noteCardRepository.storedSnapshots.find(
            (card) => card.noteId === note.id.getValue(),
        );

    describe('Scenario: R21, R24, the texts give the values', () => {
        it('searches with what was typed and the folders, reads three pages, and fills the card', async () => {
            const card = ctx.givenCardOf(chezPaul);
            ctx.noteCardWriter.willWrite({
                kind: 'VALUES',
                values: VALUES,
                sourceUrls: ['https://a.example/'],
            });
            await enrich();
            expect(ctx.webSearchProvider.queries).toEqual([
                'Chez Paul Restaurants Lyon',
            ]);
            expect(ctx.webPageReader.requestedUrls).toEqual([
                [
                    'https://a.example/',
                    'https://b.example/',
                    'https://c.example/',
                ],
            ]);
            expect(ctx.noteCardWriter.cardRequests).toEqual([
                {
                    subject: PROPOSED_TEMPLATE.subject,
                    folderNames: ['Restaurants', 'Lyon'],
                    fieldNames: ['Adresse', 'Cuisine', 'Prix'],
                    query: 'Chez Paul',
                    results: RESULTS,
                    pages: [
                        {
                            url: 'https://a.example/',
                            text: 'Chez Paul, 11 rue Mercière',
                        },
                        {
                            url: 'https://c.example/',
                            text: 'Cuisine lyonnaise',
                        },
                    ],
                },
            ]);
            expect(stored(chezPaul)).toMatchObject({
                status: NoteCardStatusEnum.FILLED,
                fields: [
                    {
                        name: 'Adresse',
                        value: '11 rue Mercière',
                        isManual: false,
                    },
                    { name: 'Cuisine', value: 'Lyonnaise', isManual: false },
                    { name: 'Prix', value: null, isManual: false },
                ],
                sources: ['https://a.example/'],
                searchedAt: NOW.toISOString(),
                version: 2,
            });
            expect(ctx.searchCounter.recorded).toEqual([
                {
                    coupleId: COUPLE_ID,
                    noteCardId: card.id.getValue(),
                    searchedAt: NOW,
                },
            ]);
            // Ids: the two folders and their events 1 to 4, the note 5 and its event 6, the card 7 and its event 8.
            const searched = {
                eventId: '00000000-0000-7000-8000-000000000009',
                eventName: NoteCardSearchedEvent.EVENT_NAME,
                aggregateId: card.id.getValue(),
                context: AS_B,
                data: {
                    noteId: chezPaul.id.getValue(),
                    status: NoteCardStatusEnum.FILLED,
                },
                occurredAt: NOW,
            };
            expect(ctx.noteCardRepository.persistedEvents).toEqual([searched]);
            expect(ctx.eventPublisher.published).toEqual([searched]);
        });

        it('R22: asks only for the fields not corrected by hand', async () => {
            const card = ctx.givenCardOf(chezPaul);
            card.correctField(AS_A.userId, 'Prix', '25 €', NOW);
            card.clearDomainEvents();
            ctx.noteCardRepository.seed(card);
            ctx.noteCardWriter.willWrite({
                kind: 'VALUES',
                values: VALUES,
                sourceUrls: [],
            });
            await enrich();
            expect(ctx.noteCardWriter.cardRequests[0]?.fieldNames).toEqual([
                'Adresse',
                'Cuisine',
            ]);
            expect(stored(chezPaul)?.fields[2]).toEqual({
                name: 'Prix',
                value: '25 €',
                isManual: true,
            });
        });
    });

    describe('Scenario: R19, the name is ambiguous', () => {
        it('shows the candidates', async () => {
            ctx.givenCardOf(chezPaul);
            const candidates = [
                { label: 'Chez Paul', detail: 'Lyon 2e' },
                { label: 'Chez Paul', detail: 'Paris 11e' },
            ];
            ctx.noteCardWriter.willWrite({ kind: 'CANDIDATES', candidates });
            await enrich();
            expect(stored(chezPaul)).toMatchObject({
                status: NoteCardStatusEnum.CHOOSING,
                candidates,
            });
        });
    });

    describe('Scenario: R23, the daily limit of Paris', () => {
        it('stops at DAILY_SEARCH_LIMIT searches of the day, without searching', async () => {
            ctx.searchCounter.givenSearches(
                COUPLE_ID,
                DAILY_SEARCH_LIMIT,
                new Date('2026-11-22T23:00:00.000Z'),
            );
            ctx.givenCardOf(chezPaul);
            await enrich();
            expect(stored(chezPaul)?.status).toBe(
                NoteCardStatusEnum.LIMIT_REACHED,
            );
            expect(ctx.webSearchProvider.queries).toEqual([]);
        });

        it('counts nothing of the day before in Paris, nor of another couple', async () => {
            ctx.searchCounter.givenSearches(
                COUPLE_ID,
                DAILY_SEARCH_LIMIT,
                new Date('2026-11-22T22:59:59.999Z'),
            );
            ctx.searchCounter.givenSearches(
                'another-couple',
                DAILY_SEARCH_LIMIT,
                NOW,
            );
            ctx.searchCounter.givenSearches(
                COUPLE_ID,
                DAILY_SEARCH_LIMIT - 1,
                NOW,
            );
            ctx.givenCardOf(chezPaul);
            ctx.noteCardWriter.willWrite({
                kind: 'VALUES',
                values: VALUES,
                sourceUrls: [],
            });
            await enrich();
            expect(stored(chezPaul)?.status).toBe(NoteCardStatusEnum.FILLED);
        });
    });

    describe('Scenario: R20, the search fails', () => {
        it.each([
            [
                'the search engine does not answer',
                () => ctx.webSearchProvider.willBeUnavailable(),
            ],
            ['the AI does not answer', () => undefined],
        ])(
            'fails the card when %s, the search counted',
            async (_label, given) => {
                given();
                ctx.givenCardOf(chezPaul);
                await enrich();
                expect(stored(chezPaul)?.status).toBe(
                    NoteCardStatusEnum.FAILED,
                );
                expect(ctx.searchCounter.recorded).toHaveLength(1);
            },
        );

        it('fails the card of a note gone or moved out of the smart folders, without searching', async () => {
            const gone = ctx.givenNoteOf(AS_A, 'Fermé', lyon);
            ctx.givenCardOf(chezPaul);
            ctx.givenCardOf(gone);
            gone.delete(AS_A.userId, NOW);
            ctx.noteRepository.seed(gone);
            chezPaul.moveTo(PARTNER_B, NoteSpaceEnum.SHARED, null, NOW);
            ctx.noteRepository.seed(chezPaul);
            await enrich();
            expect([stored(chezPaul)?.status, stored(gone)?.status]).toEqual([
                NoteCardStatusEnum.FAILED,
                NoteCardStatusEnum.FAILED,
            ]);
            expect(ctx.webSearchProvider.queries).toEqual([]);
        });

        it('lets a defect through, the card left « en recherche » for the next pass', async () => {
            ctx.givenCardOf(chezPaul);
            ctx.noteCardWriter.willBreak();
            await expect(enrich()).rejects.toThrow('Fake writer defect');
            expect(stored(chezPaul)?.status).toBe(NoteCardStatusEnum.PENDING);
        });
    });

    describe('Scenario: decision 0054, a few cards per pass', () => {
        it('takes the batch, oldest request first, one after the other', async () => {
            const notes = ['Un', 'Deux', 'Trois', 'Quatre'].map(
                (title, index) => {
                    ctx.dateTimeProvider.setNow(
                        new Date(NOW.getTime() + index * 1000),
                    );
                    return ctx.givenNoteOf(AS_A, title, lyon);
                },
            );
            notes.forEach((note) => ctx.givenCardOf(note));
            ctx.noteCardWriter.willWrite({
                kind: 'VALUES',
                values: {},
                sourceUrls: [],
            });
            await enrich();
            expect(notes.map((note) => stored(note)?.status)).toEqual([
                NoteCardStatusEnum.FILLED,
                NoteCardStatusEnum.FILLED,
                NoteCardStatusEnum.FILLED,
                NoteCardStatusEnum.PENDING,
            ]);
        });
    });
});
