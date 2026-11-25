import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { fail } from '@cocooning/shared-kernel/utils';
import { act, renderHook } from '@testing-library/react';
import { FakeNoteCardCommandGateway } from '../gateways/fake/fake-note-card-command.gateway';
import { NoteCardCommandEnum } from '../view-models/note-card-command.view-model';
import { useNoteCardCommands } from './use-note-card-commands';

const FOLDER_ID = '01936b2e-7c4a-7000-8000-0000000000e3';
const NOTE_ID = '01936b2e-7c4a-7000-8000-0000000000f3';
const NOT_SMART: ApiError = {
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message: 'Not smart',
    backendCode: NoteExceptionCodeEnum.FOLDER_NOT_SMART,
};

function renderCommands() {
    const gateway = new FakeNoteCardCommandGateway();
    const events: string[] = [];
    const { result } = renderHook(() =>
        useNoteCardCommands({
            gateway,
            onDone: (command) => events.push(`${command}:done`),
            onFailed: (command, error) =>
                events.push(`${command}:${error.backendCode}`),
        }),
    );
    return { result, events, gateway };
}

describe('Feature: the commands on the cards of a smart folder', () => {
    describe('Scenario: R19, a partner picks a candidate or refines the search', () => {
        it('chooses a candidate by its position, then refines', async () => {
            const { result, events, gateway } = renderCommands();

            await act(async () =>
                result.current.chooseNoteCardCandidate(NOTE_ID, 1),
            );
            await act(async () =>
                result.current.refineNoteCard(NOTE_ID, { query: 'Lyon 1er' }),
            );

            expect(gateway.answers.calls).toEqual([
                {
                    operation: 'chooseNoteCardCandidate',
                    noteId: NOTE_ID,
                    candidateIndex: 1,
                },
                {
                    operation: 'refineNoteCard',
                    noteId: NOTE_ID,
                    form: { query: 'Lyon 1er' },
                },
            ]);
            expect(events).toEqual(['CHOOSE:done', 'REFINE:done']);
        });
    });

    describe('Scenario: R19, a partner adds an item by its name', () => {
        it('adds the name to the folder', async () => {
            const { result, events, gateway } = renderCommands();

            await act(async () =>
                result.current.addNoteCard(FOLDER_ID, { name: 'Chez Paul' }),
            );

            expect(gateway.answers.calls).toEqual([
                {
                    operation: 'addNoteCard',
                    folderId: FOLDER_ID,
                    form: { name: 'Chez Paul' },
                },
            ]);
            expect(events).toEqual(['ADD:done']);
        });

        it('says why the API refuses', async () => {
            const { result, events, gateway } = renderCommands();
            gateway.answers.givenOutcome(fail(NOT_SMART));

            await act(async () =>
                result.current.addNoteCard(FOLDER_ID, { name: 'Chez Paul' }),
            );

            expect(events).toEqual(['ADD:FOLDER_NOT_SMART']);
        });

        it('tells which command runs until the API answers', async () => {
            const { result, gateway } = renderCommands();
            const release = gateway.answers.holdAnswers();

            act(() =>
                result.current.addNoteCard(FOLDER_ID, { name: 'Chez Paul' }),
            );
            expect(result.current.pending).toBe(NoteCardCommandEnum.ADD);
            expect(result.current.isBusy).toBe(true);
            await act(async () => release());

            expect(result.current.pending).toBeNull();
        });
    });
});
