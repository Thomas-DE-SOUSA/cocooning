import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { fail } from '@cocooning/shared-kernel/utils';
import { act, renderHook } from '@testing-library/react';
import { FakeNoteCommandGateway } from '../gateways/fake/fake-note-command.gateway';
import { useRenameNote } from './use-rename-note';

const NOTE_ID = '01936b2e-7c4a-7000-8000-0000000000d1';
const REFUSAL: ApiError = {
    code: ApiErrorCodeEnum.NOT_FOUND,
    message: 'Note not found',
    backendCode: 'NOTE_NOT_FOUND',
};

function renderRename(gateway: FakeNoteCommandGateway) {
    const events: string[] = [];
    const { result } = renderHook(() =>
        useRenameNote({
            gateway,
            noteId: NOTE_ID,
            onDone: (form) => events.push(`done:${form.title}`),
            onFailed: (error) => events.push(`failed:${error.code}`),
        }),
    );
    return { result, events };
}

describe('Feature: R6, a partner renames the note she reads', () => {
    it('sends the title for that note and reports it done', async () => {
        const gateway = new FakeNoteCommandGateway();
        const { result, events } = renderRename(gateway);

        await act(async () => result.current.renameNote({ title: 'Courses' }));

        expect(gateway.calls).toEqual([
            {
                operation: 'renameNote',
                noteId: NOTE_ID,
                form: { title: 'Courses' },
            },
        ]);
        expect(events).toEqual(['done:Courses']);
    });

    it('says the renaming runs until the answer arrives', async () => {
        const gateway = new FakeNoteCommandGateway();
        const release = gateway.holdAnswers();
        const { result } = renderRename(gateway);

        act(() => result.current.renameNote({ title: 'Courses' }));
        expect(result.current.isRenaming).toBe(true);
        await act(async () => release());
        expect(result.current.isRenaming).toBe(false);
    });

    it('reports a refusal', async () => {
        const gateway = new FakeNoteCommandGateway();
        gateway.givenOutcome(fail(REFUSAL));
        const { result, events } = renderRename(gateway);

        await act(async () => result.current.renameNote({ title: 'Courses' }));

        expect(events).toEqual(['failed:NOT_FOUND']);
    });
});
