import {
    ChooseNoteCardCandidateUseCase,
    RefineNoteCardUseCase,
} from '@cocooning/couple-client-business-logic/notes';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_CHOOSING_NOTE_CARD,
    FakeNoteCardsGateway,
} from '@cocooning/couple-client-business-logic/testing';
import { NOTE_CARD_QUERY_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { ok } from '@cocooning/shared-kernel/utils';
import {
    chooseNoteCardCandidate,
    refineNoteCard,
} from './note-card-choice.service';

const NOTE_ID = A_CHOOSING_NOTE_CARD.noteId;

describe('Feature: R19, the choice of a candidate sent by the server actions', () => {
    let gateway: FakeNoteCardsGateway;

    beforeEach(() => {
        gateway = new FakeNoteCardsGateway();
    });

    const choose = (noteId: unknown, index: unknown) =>
        chooseNoteCardCandidate(
            noteId,
            index,
            new ChooseNoteCardCandidateUseCase(gateway),
        );
    const refine = (noteId: unknown, input: unknown) =>
        refineNoteCard(noteId, input, {
            t: (key) => key,
            refineNoteCard: new RefineNoteCardUseCase(gateway),
        });

    it('sends the position of the candidate chosen', async () => {
        expect(await choose(NOTE_ID, 1)).toEqual(ok(null));
        expect(gateway.calls).toEqual([
            {
                operation: 'chooseNoteCardCandidate',
                noteId: NOTE_ID,
                request: { candidateIndex: 1 },
            },
        ]);
    });

    it('sends the trimmed precision', async () => {
        expect(await refine(NOTE_ID, { query: ' Lyon 1er ' })).toEqual(
            ok(null),
        );
        expect(gateway.calls).toEqual([
            {
                operation: 'refineNoteCard',
                noteId: NOTE_ID,
                request: { query: 'Lyon 1er' },
            },
        ]);
    });

    it.each([
        ['a position outside the candidates', () => choose(NOTE_ID, 3)],
        ['an id that is not a note id', () => choose('paul', 0)],
        ['an empty precision', () => refine(NOTE_ID, { query: ' ' })],
        [
            'a precision above the maximum',
            () =>
                refine(NOTE_ID, {
                    query: 'a'.repeat(NOTE_CARD_QUERY_MAX_LENGTH + 1),
                }),
        ],
        ['an id that is not a note id', () => refine('paul', { query: 'L' })],
    ])('refuses %s without calling the API', async (_label, send) => {
        const result = await send();
        expect(result.success === false && result.error.code).toBe(
            ApiErrorCodeEnum.VALIDATION_ERROR,
        );
        expect(gateway.calls).toEqual([]);
    });
});
