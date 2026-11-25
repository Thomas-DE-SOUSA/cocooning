import { NoteCardStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import type { Note } from '../../domain/models/note.aggregate';
import type { Place } from '../../domain/models/place';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';

const RESULTS = [
    {
        title: 'Folie Piment - TheFork',
        url: 'https://thefork.example/folie-piment',
        snippet: 'Restaurant chinois',
    },
];
const FOLIE_PIMENT: Place = {
    name: 'Folie piment',
    address: '53 Rue de Montreuil, 75011 Paris',
    kind: 'restaurant',
    cuisine: 'chinese;sichuan',
    openingHours: 'Mo-Sa 12:00-14:30,19:00-22:30',
    phone: '+33 9 83 54 41 83',
    website: null,
    url: 'https://www.openstreetmap.org/node/10678978971',
};

describe('Feature: OpenStreetMap completes the card of a place (decision 0055, R24)', () => {
    let ctx: NotesTestContext;
    let foliePiment: Note;

    beforeEach(() => {
        ctx = new NotesTestContext();
        const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
        const paris = ctx.givenSmartFolderOf(AS_A, 'Paris', restaurants);
        foliePiment = ctx.givenNoteOf(AS_B, 'Folie Piment', paris);
        ctx.givenCardOf(foliePiment);
        ctx.webSearchProvider.willFind(RESULTS);
    });
    afterEach(() => NoteId.resetForTests());

    const enrich = () => ctx.enrichPendingNoteCardsUseCase().execute();
    const stored = () =>
        ctx.noteCardRepository.storedSnapshots.find(
            (card) => card.noteId === foliePiment.id.getValue(),
        );

    it('asks OpenStreetMap the words of the search, gives the place to the AI and keeps it as a source', async () => {
        ctx.placeDirectory.willFind(FOLIE_PIMENT);
        ctx.noteCardWriter.willWrite({
            kind: 'VALUES',
            values: { Adresse: FOLIE_PIMENT.address },
            sourceUrls: [FOLIE_PIMENT.url],
        });
        await enrich();
        expect(ctx.placeDirectory.queries).toEqual([
            'Folie Piment Restaurants Paris',
        ]);
        expect(ctx.webSearchProvider.queries).toEqual(
            ctx.placeDirectory.queries,
        );
        expect(ctx.noteCardWriter.cardRequests[0]).toMatchObject({
            place: FOLIE_PIMENT,
            results: RESULTS,
        });
        expect(stored()).toMatchObject({
            status: NoteCardStatusEnum.FILLED,
            sources: [FOLIE_PIMENT.url],
        });
    });

    it('writes the card from the web alone when OpenStreetMap has no place', async () => {
        ctx.noteCardWriter.willWrite({
            kind: 'VALUES',
            values: {},
            sourceUrls: [],
        });
        await enrich();
        expect(ctx.noteCardWriter.cardRequests[0]?.place).toBeNull();
        expect(stored()?.status).toBe(NoteCardStatusEnum.FILLED);
    });

    it('fails the card when the search engine is down, even with a place', async () => {
        ctx.placeDirectory.willFind(FOLIE_PIMENT);
        ctx.webSearchProvider.willBeUnavailable();
        await enrich();
        expect(stored()?.status).toBe(NoteCardStatusEnum.FAILED);
        expect(ctx.noteCardWriter.cardRequests).toEqual([]);
    });
});
