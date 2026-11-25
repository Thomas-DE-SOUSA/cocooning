import {
    CorrectNoteCardFieldUseCase,
    RefreshNoteCardUseCase,
} from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    A_FILLED_NOTE_CARD,
    FakeNoteCardsGateway,
} from '@cocooning/couple-client-business-logic/testing';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { CARD_FIELD_VALUE_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import {
    correctNoteCardField,
    refreshNoteCard,
} from './note-card-fields.service';

const NOTE_ID = A_FILLED_NOTE_CARD.noteId;

describe('Feature: R22, the fields of a card sent by the server actions', () => {
    let gateway: FakeNoteCardsGateway;

    beforeEach(() => {
        gateway = new FakeNoteCardsGateway();
    });

    const refresh = (noteId: unknown) =>
        refreshNoteCard(noteId, new RefreshNoteCardUseCase(gateway));
    const correct = (noteId: unknown, name: unknown, input: unknown) =>
        correctNoteCardField(noteId, name, input, {
            t: (key) => key,
            correctNoteCardField: new CorrectNoteCardFieldUseCase(gateway),
        });

    it('updates the card of the note', async () => {
        expect(await refresh(NOTE_ID)).toEqual(ok(null));
        expect(gateway.calls).toEqual([
            { operation: 'refreshNoteCard', noteId: NOTE_ID },
        ]);
    });

    it('sends the field and its trimmed value', async () => {
        expect(await correct(NOTE_ID, 'Prix', { value: ' 30 € ' })).toEqual(
            ok(null),
        );
        expect(gateway.calls).toEqual([
            {
                operation: 'correctNoteCardField',
                noteId: NOTE_ID,
                request: { name: 'Prix', value: '30 €' },
            },
        ]);
    });

    it.each([
        ['an id that is not a note id', () => refresh('paul')],
        ['an empty value', () => correct(NOTE_ID, 'Prix', { value: ' ' })],
        [
            'a value above the maximum',
            () =>
                correct(NOTE_ID, 'Prix', {
                    value: 'a'.repeat(CARD_FIELD_VALUE_MAX_LENGTH + 1),
                }),
        ],
        ['an empty field name', () => correct(NOTE_ID, '', { value: '30' })],
    ])('refuses %s without calling the API', async (_label, send) => {
        const result = await send();
        expect(result.success === false && result.error.code).toBe(
            ApiErrorCodeEnum.VALIDATION_ERROR,
        );
        expect(gateway.calls).toEqual([]);
    });

    it('R25, passes the refusal outside a smart folder through', async () => {
        const refusal: ApiError = {
            code: ApiErrorCodeEnum.VALIDATION_ERROR,
            message: 'Not smart',
            backendCode: NoteExceptionCodeEnum.FOLDER_NOT_SMART,
        };
        gateway.givenRefusal(refusal);

        expect(await refresh(NOTE_ID)).toEqual(fail(refusal));
    });
});
