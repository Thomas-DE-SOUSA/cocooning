import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail } from '@cocooning/shared-kernel/utils';
import { act, renderHook } from '@testing-library/react';
import { FakeFolderCommandGateway } from '../gateways/fake/fake-folder-command.gateway';
import { FakeNoteCommandGateway } from '../gateways/fake/fake-note-command.gateway';
import { NoteSheetCommandEnum } from '../view-models/note-sheet-command.view-model';
import { useNoteSheetCommands } from './use-note-sheet-commands';

const IN_A_FOLDER = {
    space: NoteSpaceEnum.PRIVATE,
    folderId: '01936b2e-7c4a-7000-8000-0000000000e1',
};

function renderCommands() {
    const notes = new FakeNoteCommandGateway();
    const folders = new FakeFolderCommandGateway();
    const events: string[] = [];
    const { result } = renderHook(() =>
        useNoteSheetCommands({
            gateways: { notes, folders },
            onDone: (command) => events.push(`${command}:done`),
            onFailed: (command, error) =>
                events.push(`${command}:${error.backendCode}`),
        }),
    );
    return { result, events, notes, folders };
}

describe('Feature: the commands of the sheets of the notes', () => {
    describe('Scenario: R13, a partner creates where she is', () => {
        it('creates a note in the place of the screen', async () => {
            const { result, events, notes } = renderCommands();

            await act(async () =>
                result.current.createNote({ title: 'Courses' }, IN_A_FOLDER),
            );

            expect(notes.answers.calls).toEqual([
                {
                    operation: 'createNote',
                    form: { title: 'Courses' },
                    destination: IN_A_FOLDER,
                },
            ]);
            expect(events).toEqual(['CREATE_NOTE:done']);
        });

        it('creates a folder in the place of the screen', async () => {
            const { result, events, folders } = renderCommands();

            await act(async () =>
                result.current.createFolder({ name: 'Maison' }, IN_A_FOLDER),
            );

            expect(folders.answers.calls).toEqual([
                {
                    operation: 'createFolder',
                    form: { name: 'Maison' },
                    destination: IN_A_FOLDER,
                },
            ]);
            expect(events).toEqual(['CREATE_FOLDER:done']);
        });
    });

    describe('Scenario: a command is running', () => {
        it('tells which one until the answer arrives', async () => {
            const { result, folders } = renderCommands();
            const release = folders.answers.holdAnswers();

            act(() =>
                result.current.createFolder({ name: 'Maison' }, IN_A_FOLDER),
            );

            expect(result.current.pending).toBe(
                NoteSheetCommandEnum.CREATE_FOLDER,
            );
            expect(result.current.isBusy).toBe(true);
            await act(async () => release());
            expect(result.current.pending).toBeNull();
        });
    });

    describe('Scenario: the API refuses the command', () => {
        it('reports the refusal with its command', async () => {
            const refusal: ApiError = {
                code: ApiErrorCodeEnum.VALIDATION_ERROR,
                message: 'Folder of another space',
                backendCode: NoteExceptionCodeEnum.FOLDER_SPACE_MISMATCH,
            };
            const { result, events, folders } = renderCommands();
            folders.answers.givenOutcome(fail(refusal));

            await act(async () =>
                result.current.createFolder({ name: 'Maison' }, IN_A_FOLDER),
            );

            expect(events).toEqual(['CREATE_FOLDER:FOLDER_SPACE_MISMATCH']);
        });
    });
});
