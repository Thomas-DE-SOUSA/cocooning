import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { ok } from '@cocooning/shared-kernel/utils';
import { ServerActionNoteListCommandGateway } from './server-action-note-list-command.gateway';

const LIST_ID = '01936b2e-7c4a-7000-8000-0000000000e1';
const CARREFOUR = {
    kind: 'GROCERIES',
    space: 'SHARED',
    title: 'Carrefour',
    emoji: null,
} as const;
const rejects = () => Promise.reject(new TypeError('Failed to fetch'));

describe('Feature: list commands through the server actions', () => {
    it('gives the result of each action with its input', async () => {
        const sent: unknown[] = [];
        const gateway = new ServerActionNoteListCommandGateway({
            createList: (...input) => {
                sent.push(input);
                return Promise.resolve(ok(LIST_ID));
            },
            editList: (...input) => {
                sent.push(input);
                return Promise.resolve(ok(null));
            },
            deleteList: (...input) => {
                sent.push(input);
                return Promise.resolve(ok(null));
            },
        });

        await expect(gateway.createList(CARREFOUR)).resolves.toEqual(
            ok(LIST_ID),
        );
        await gateway.editList(LIST_ID, { title: 'Lidl', emoji: null });
        await gateway.deleteList(LIST_ID);

        expect(sent).toEqual([
            [CARREFOUR],
            [LIST_ID, { title: 'Lidl', emoji: null }],
            [LIST_ID],
        ]);
    });

    it('gives a network error when the phone cannot reach the server', async () => {
        const gateway = new ServerActionNoteListCommandGateway({
            createList: rejects,
            editList: rejects,
            deleteList: rejects,
        });

        await expect(gateway.deleteList(LIST_ID)).resolves.toMatchObject({
            success: false,
            error: { code: ApiErrorCodeEnum.NETWORK_ERROR },
        });
    });
});
