import type { NoteCardWritingRequest } from '@cocooning/couple-server-business-logic/notes';
import { toNoteCardWriting } from './card-writing.answer';
import {
    CardWritingAnswerSchema,
    cardWritingPrompt,
} from './card-writing.prompt';

const REQUEST: NoteCardWritingRequest = {
    subject: 'Les restaurants',
    folderNames: ['Restaurants', 'Lyon'],
    fieldNames: ['Adresse', 'Prix'],
    query: 'Chez Paul',
    place: null,
    results: [{ title: 'T', url: 'https://a.example/', snippet: 'S' }],
    pages: [{ url: 'https://b.example/', text: 'Texte' }],
};

describe('Feature: what the AI writes on a card (R19, R21, R24)', () => {
    it('sends the subject, the folders, the fields, what was typed and the texts found', () => {
        const prompt = cardWritingPrompt(REQUEST);
        expect(prompt.operation).toBe('writeCard');
        expect(JSON.parse(prompt.input)).toEqual({
            subject: 'Les restaurants',
            folderNames: ['Restaurants', 'Lyon'],
            fields: ['Adresse', 'Prix'],
            typed: 'Chez Paul',
            openStreetMap: null,
            searchResults: REQUEST.results,
            pages: REQUEST.pages,
        });
    });

    it('keeps the fields asked for and the sources given only, an empty value as « non trouvé »', () => {
        const answer = CardWritingAnswerSchema.parse({
            kind: 'VALUES',
            candidates: [],
            values: [
                { field: 'Adresse', value: ' 11 rue Mercière ' },
                { field: 'Prix', value: '' },
                { field: 'Horaires', value: '12h' },
            ],
            sourceUrls: [
                'https://a.example/',
                'https://a.example/',
                'https://made-up.example/',
            ],
        });
        expect(toNoteCardWriting(answer, REQUEST)).toEqual({
            kind: 'VALUES',
            values: { Adresse: '11 rue Mercière', Prix: null },
            sourceUrls: ['https://a.example/'],
        });
    });

    it('passes the candidates, and refuses a single one', () => {
        const candidates = [
            { label: 'Chez Paul', detail: 'Lyon' },
            { label: 'Chez Paul', detail: 'Paris' },
        ];
        const answer = CardWritingAnswerSchema.parse({
            kind: 'CANDIDATES',
            candidates,
            values: [],
            sourceUrls: [],
        });
        expect(toNoteCardWriting(answer, REQUEST)).toEqual({
            kind: 'CANDIDATES',
            candidates,
        });
        expect(
            CardWritingAnswerSchema.safeParse({
                kind: 'CANDIDATES',
                candidates: [candidates[0]],
            }).success,
        ).toBe(false);
    });
});
