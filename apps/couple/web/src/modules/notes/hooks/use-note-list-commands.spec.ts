import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
    A_CREATED_LIST_ID,
    FakeNoteListCommandGateway,
} from '../gateways/fake/fake-note-list-command.gateway';
import { useNoteListCommands } from './use-note-list-commands';

const CARREFOUR = {
    kind: 'GROCERIES',
    space: 'SHARED',
    title: 'Carrefour',
    emoji: '🛒',
} as const;
const REFUSED = {
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message: 'Invalid',
    backendCode: 'NOTE_LIST_EMOJI_INVALID',
};

function renderCommands(gateway: FakeNoteListCommandGateway) {
    const journal: string[] = [];
    const view = renderHook(() =>
        useNoteListCommands({
            gateway,
            onCreated: (noteId) => journal.push(`created ${noteId}`),
            onEdited: () => journal.push('edited'),
            onDeleted: () => journal.push('deleted'),
            onFailed: (command, error) =>
                journal.push(`${command} refused ${error.backendCode}`),
        }),
    );
    return { ...view, journal };
}

describe('Feature: the commands of the Lists tab (R26)', () => {
    it('creates a list and opens it by the id it answers', async () => {
        const gateway = new FakeNoteListCommandGateway();
        const { result, journal } = renderCommands(gateway);

        act(() => result.current.createList(CARREFOUR));

        await waitFor(() =>
            expect(journal).toEqual([`created ${A_CREATED_LIST_ID}`]),
        );
        expect(gateway.calls).toEqual([
            { operation: 'createList', form: CARREFOUR },
        ]);
    });

    it('changes the title and the emoji of a list, then deletes it', async () => {
        const gateway = new FakeNoteListCommandGateway();
        const { result, journal } = renderCommands(gateway);

        act(() =>
            result.current.editList(A_CREATED_LIST_ID, {
                title: 'Lidl',
                emoji: null,
            }),
        );
        await waitFor(() => expect(journal).toEqual(['edited']));
        act(() => result.current.deleteList(A_CREATED_LIST_ID));
        await waitFor(() => expect(journal).toEqual(['edited', 'deleted']));

        expect(gateway.calls.map(({ operation }) => operation)).toEqual([
            'editList',
            'deleteList',
        ]);
    });

    it('says which command was refused', async () => {
        const gateway = new FakeNoteListCommandGateway();
        gateway.givenRefusal(REFUSED);
        const { result, journal } = renderCommands(gateway);

        act(() => result.current.createList(CARREFOUR));

        await waitFor(() =>
            expect(journal).toEqual([
                'CREATE_LIST refused NOTE_LIST_EMOJI_INVALID',
            ]),
        );
    });
});
