import {
    A_SHARED_NOTE,
    FakeNotesGateway,
} from '@cocooning/couple-client-business-logic/testing';
import { CreateNoteUseCase } from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { actOnNote, createNote } from './note-commands.service';

const REFUSAL: ApiError = {
    code: ApiErrorCodeEnum.FORBIDDEN,
    message: 'Reserved to owner',
    backendCode: 'NOTE_RESERVED_TO_OWNER',
};

describe('Feature: note commands sent by the server actions', () => {
    let gateway: FakeNotesGateway;

    beforeEach(() => {
        gateway = new FakeNotesGateway();
    });

    const create = (input: unknown) =>
        createNote(input, {
            t: (key) => key,
            createNote: new CreateNoteUseCase(gateway),
        });

    describe('Scenario: R8, a partner creates a note', () => {
        it('sends the trimmed title once', async () => {
            expect(await create({ title: '  Courses ' })).toEqual(ok(null));
            expect(gateway.calls).toEqual([
                { operation: 'createNote', request: { title: 'Courses' } },
            ]);
        });

        it('refuses an empty title without calling the API (rule 14)', async () => {
            const result = await create({ title: '   ' });
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.VALIDATION_ERROR,
            );
            expect(gateway.calls).toEqual([]);
        });
    });

    describe('Scenario: R5, R7, the owner acts on a note', () => {
        it('sends the note id to the action and drops the note', async () => {
            const sent: string[] = [];
            const result = await actOnNote(A_SHARED_NOTE.noteId, (noteId) => {
                sent.push(noteId);
                return Promise.resolve(ok(A_SHARED_NOTE));
            });
            expect(result).toEqual(ok(null));
            expect(sent).toEqual([A_SHARED_NOTE.noteId]);
        });

        it('passes the refusal of the API through', async () => {
            const result = await actOnNote(A_SHARED_NOTE.noteId, () =>
                Promise.resolve(fail(REFUSAL)),
            );
            expect(result).toEqual(fail(REFUSAL));
        });

        it('refuses an id that is not a note id without calling the API', async () => {
            const sent: string[] = [];
            const result = await actOnNote('../couple', (noteId) => {
                sent.push(noteId);
                return Promise.resolve(ok(null));
            });
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.VALIDATION_ERROR,
            );
            expect(sent).toEqual([]);
        });
    });
});
