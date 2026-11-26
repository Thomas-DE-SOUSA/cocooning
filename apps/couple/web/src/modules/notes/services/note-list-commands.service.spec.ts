import { CreateNoteListUseCase } from '@cocooning/couple-client-business-logic/notes';
import { FakeNoteListsGateway } from '@cocooning/couple-client-business-logic/testing';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { fail } from '@cocooning/shared-kernel/utils';
import { createNoteList } from './note-list-commands.service';

const CARREFOUR = {
    kind: 'GROCERIES',
    space: 'SHARED',
    title: ' Carrefour ',
    emoji: '',
};

describe('Feature: a list created by the server action (R26)', () => {
    let gateway: FakeNoteListsGateway;

    beforeEach(() => {
        gateway = new FakeNoteListsGateway();
    });

    const create = (input: unknown) =>
        createNoteList(input, {
            t: (key) => key,
            createNoteList: new CreateNoteListUseCase(gateway),
        });

    it('validates the form again and answers the id of the new list', async () => {
        const result = await create(CARREFOUR);

        expect(result.success).toBe(true);
        expect(gateway.calls).toEqual([
            {
                operation: 'create',
                request: {
                    kind: 'GROCERIES',
                    space: 'SHARED',
                    title: 'Carrefour',
                    emoji: null,
                },
            },
        ]);
    });

    it('refuses a form the screen would have refused, without calling the API', async () => {
        await expect(create({ ...CARREFOUR, kind: 'WISHES' })).resolves.toEqual(
            fail({
                code: ApiErrorCodeEnum.VALIDATION_ERROR,
                message: 'Invalid note list form',
                backendCode: null,
            }),
        );
        expect(gateway.calls).toEqual([]);
    });
});
