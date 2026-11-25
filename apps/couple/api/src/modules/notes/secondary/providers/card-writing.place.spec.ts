import type {
    NoteCardWritingRequest,
    Place,
} from '@cocooning/couple-server-business-logic/notes';
import { toNoteCardWriting } from './card-writing.answer';
import {
    CardWritingAnswerSchema,
    cardWritingPrompt,
} from './card-writing.prompt';

const FOLIE_PIMENT: Place = {
    name: 'Folie piment',
    address: '53 Rue de Montreuil, 75011 Paris',
    kind: 'restaurant',
    cuisine: 'chinese;sichuan',
    openingHours: 'Mo-Sa 12:00-14:30,19:00-22:30',
    phone: '+33983544183',
    website: null,
    url: 'https://www.openstreetmap.org/node/10678978971',
};
const REQUEST: NoteCardWritingRequest = {
    subject: 'Les restaurants',
    folderNames: ['Restaurants', 'Paris'],
    fieldNames: ['Adresse', 'Horaires'],
    query: 'Folie Piment',
    place: FOLIE_PIMENT,
    results: [{ title: 'T', url: 'https://a.example/', snippet: 'S' }],
    pages: [],
};

describe('Feature: the place of OpenStreetMap on a card (decision 0055)', () => {
    it('gives the place first, as one labeled text without the missing tags', () => {
        const input = JSON.parse(cardWritingPrompt(REQUEST).input) as Record<
            string,
            unknown
        >;
        expect(Object.keys(input).indexOf('openStreetMap')).toBeLessThan(
            Object.keys(input).indexOf('searchResults'),
        );
        expect(input['openStreetMap']).toEqual({
            url: FOLIE_PIMENT.url,
            text: [
                'OpenStreetMap',
                'name: Folie piment',
                'kind: restaurant',
                'address: 53 Rue de Montreuil, 75011 Paris',
                'cuisine: chinese;sichuan',
                'opening hours: Mo-Sa 12:00-14:30,19:00-22:30',
                'phone: +33983544183',
            ].join('\n'),
        });
    });

    it('keeps the page of the place among the sources the AI used', () => {
        const answer = CardWritingAnswerSchema.parse({
            kind: 'VALUES',
            candidates: [],
            values: [{ field: 'Adresse', value: FOLIE_PIMENT.address }],
            sourceUrls: [FOLIE_PIMENT.url, 'https://a.example/'],
        });
        expect(toNoteCardWriting(answer, REQUEST)).toMatchObject({
            sourceUrls: [FOLIE_PIMENT.url, 'https://a.example/'],
        });
    });
});
