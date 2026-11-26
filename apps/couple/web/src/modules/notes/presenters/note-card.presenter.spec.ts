import {
    A_CHOOSING_NOTE_CARD,
    A_SHARED_NOTE,
    A_SMART_SPACE_CONTENTS,
} from '@cocooning/couple-client-business-logic/testing';
import { NoteCardStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { presentNoteCard } from './note-card.presenter';

const [FILLED, PENDING, CHOOSING] = A_SMART_SPACE_CONTENTS.notes;

describe('Feature: the card on the page of a note (R20 to R22, R25)', () => {
    it('has none for a note outside a smart folder', () => {
        expect(
            presentNoteCard(
                { ...A_SHARED_NOTE, card: null, listKind: null, emoji: null },
                false,
            ),
        ).toBeNull();
    });

    it('gives the fields, the sources and the day of the search in Paris', () => {
        expect(presentNoteCard(FILLED!, true)).toEqual({
            noteId: FILLED!.noteId,
            status: NoteCardStatusEnum.FILLED,
            fields: FILLED!.card!.fields,
            choice: null,
            sources: [
                {
                    url: 'https://example.org/chez-paul',
                    isOpenStreetMap: false,
                },
            ],
            searchedOn: '25 nov.',
            canRefresh: true,
        });
    });

    it('decision 0055, names the page of a place on OpenStreetMap', () => {
        const osm = 'https://www.openstreetmap.org/node/10678978971';
        const card = {
            ...FILLED!,
            card: {
                ...FILLED!.card!,
                sources: [osm, 'https://example.org/openstreetmap.org/'],
            },
        };
        expect(presentNoteCard(card, true)?.sources).toEqual([
            { url: osm, isOpenStreetMap: true },
            {
                url: 'https://example.org/openstreetmap.org/',
                isOpenStreetMap: false,
            },
        ]);
    });

    it('has no day before the first search, and no update outside a smart folder', () => {
        expect(presentNoteCard(PENDING!, false)).toMatchObject({
            status: NoteCardStatusEnum.PENDING,
            searchedOn: null,
            canRefresh: false,
        });
    });

    it('R19, gives the candidates of a card in doubt', () => {
        expect(presentNoteCard(CHOOSING!, true)?.choice).toEqual({
            noteId: A_CHOOSING_NOTE_CARD.noteId,
            title: 'Café des Arts',
            candidates: A_CHOOSING_NOTE_CARD.candidates,
        });
    });
});
