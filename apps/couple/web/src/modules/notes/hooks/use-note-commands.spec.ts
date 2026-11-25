import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { fail } from '@cocooning/shared-kernel/utils';
import { act, renderHook } from '@testing-library/react';
import { FakeNoteCommandGateway } from '../gateways/fake/fake-note-command.gateway';
import { NoteCommandEnum } from '../view-models/note-command.view-model';
import { useNoteCommands } from './use-note-commands';

const NOTE_ID = '01936b2e-7c4a-7000-8000-0000000000d1';
const REFUSAL: ApiError = {
    code: ApiErrorCodeEnum.FORBIDDEN,
    message: 'Reserved to owner',
    backendCode: 'NOTE_RESERVED_TO_OWNER',
};

function renderCommands(gateway: FakeNoteCommandGateway) {
    const events: string[] = [];
    const { result } = renderHook(() =>
        useNoteCommands({
            gateway,
            onDone: (command) => events.push(`${command}:done`),
            onFailed: (command, error) =>
                events.push(`${command}:${error.code}`),
        }),
    );
    return { result, events };
}

describe('Feature: note commands from the list', () => {
    describe('Scenario: R1, a partner creates a note', () => {
        it('sends the form once and asks for a refresh', async () => {
            const gateway = new FakeNoteCommandGateway();
            const { result, events } = renderCommands(gateway);

            await act(async () =>
                result.current.createNote({ title: 'Courses' }),
            );

            expect(gateway.answers.calls).toEqual([
                {
                    operation: 'createNote',
                    form: { title: 'Courses' },
                    destination: { space: 'SHARED', folderId: null },
                },
            ]);
            expect(events).toEqual(['CREATE_NOTE:done']);
            expect(result.current.pending).toBeNull();
        });
    });

    describe('Scenario: R5, R7, the owner acts on her note', () => {
        it.each([
            ['shareNote', NoteCommandEnum.SHARE_NOTE],
            ['makeNotePrivate', NoteCommandEnum.MAKE_NOTE_PRIVATE],
            ['deleteNote', NoteCommandEnum.DELETE_NOTE],
        ] as const)('sends %s for that note', async (operation, command) => {
            const gateway = new FakeNoteCommandGateway();
            const { result, events } = renderCommands(gateway);

            await act(async () => result.current[operation](NOTE_ID));

            expect(gateway.answers.calls).toEqual([
                { operation, noteId: NOTE_ID },
            ]);
            expect(events).toEqual([`${command}:done`]);
        });

        it('tells which note is running until the answer arrives', async () => {
            const gateway = new FakeNoteCommandGateway();
            const release = gateway.answers.holdAnswers();
            const { result } = renderCommands(gateway);

            act(() => result.current.shareNote(NOTE_ID));

            expect(result.current.pending).toEqual({
                command: NoteCommandEnum.SHARE_NOTE,
                noteId: NOTE_ID,
            });
            expect(result.current.isBusy).toBe(true);
            await act(async () => release());
            expect(result.current.pending).toBeNull();
        });
    });

    describe('Scenario: the API refuses the command', () => {
        it('reports the refusal with its command, without a refresh', async () => {
            const gateway = new FakeNoteCommandGateway();
            gateway.answers.givenOutcome(fail(REFUSAL));
            const { result, events } = renderCommands(gateway);

            await act(async () => result.current.deleteNote(NOTE_ID));

            expect(events).toEqual(['DELETE_NOTE:FORBIDDEN']);
        });
    });
});
