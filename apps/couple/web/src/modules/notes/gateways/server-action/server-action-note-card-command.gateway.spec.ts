import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { ok } from '@cocooning/shared-kernel/utils';
import { ServerActionNoteCardCommandGateway } from './server-action-note-card-command.gateway';

const FOLDER_ID = '01936b2e-7c4a-7000-8000-0000000000e3';
const NOTE_ID = '01936b2e-7c4a-7000-8000-0000000000f3';
const rejects = () => Promise.reject(new TypeError('Failed to fetch'));

const REJECTING = new ServerActionNoteCardCommandGateway({
    addNoteCard: rejects,
    chooseNoteCardCandidate: rejects,
    refineNoteCard: rejects,
    refreshNoteCard: rejects,
    correctNoteCardField: rejects,
});

describe('Feature: card commands through the server actions', () => {
    it('gives the result of each action with its input', async () => {
        const sent: unknown[] = [];
        const record = (...input: unknown[]) => {
            sent.push(input);
            return Promise.resolve(ok(null));
        };
        const gateway = new ServerActionNoteCardCommandGateway({
            addNoteCard: record,
            chooseNoteCardCandidate: record,
            refineNoteCard: record,
            refreshNoteCard: record,
            correctNoteCardField: record,
        });

        await expect(
            gateway.addNoteCard(FOLDER_ID, { name: 'Chez Paul' }),
        ).resolves.toEqual(ok(null));

        await gateway.chooseNoteCardCandidate(NOTE_ID, 1);
        await gateway.refineNoteCard(NOTE_ID, { query: 'Lyon 1er' });
        await gateway.refreshNoteCard(NOTE_ID);
        await gateway.correctNoteCardField(NOTE_ID, 'Prix', { value: '30 €' });

        expect(sent).toEqual([
            [FOLDER_ID, { name: 'Chez Paul' }],
            [NOTE_ID, 1],
            [NOTE_ID, { query: 'Lyon 1er' }],
            [NOTE_ID],
            [NOTE_ID, 'Prix', { value: '30 €' }],
        ]);
    });

    it.each([
        [
            'addNoteCard',
            () => REJECTING.addNoteCard(FOLDER_ID, { name: 'Chez Paul' }),
        ],
        [
            'chooseNoteCardCandidate',
            () => REJECTING.chooseNoteCardCandidate(NOTE_ID, 0),
        ],
        [
            'refineNoteCard',
            () => REJECTING.refineNoteCard(NOTE_ID, { query: 'Lyon' }),
        ],
        ['refreshNoteCard', () => REJECTING.refreshNoteCard(NOTE_ID)],
        [
            'correctNoteCardField',
            () =>
                REJECTING.correctNoteCardField(NOTE_ID, 'Prix', { value: '1' }),
        ],
    ])(
        'gives a network error instead of rejecting for %s',
        async (_label, send) => {
            const result = await send();
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.NETWORK_ERROR,
            );
        },
    );
});
