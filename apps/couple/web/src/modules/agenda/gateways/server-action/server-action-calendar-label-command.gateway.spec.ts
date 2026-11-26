import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { ok } from '@cocooning/shared-kernel/utils';
import { ServerActionCalendarLabelCommandGateway } from './server-action-calendar-label-command.gateway';

const LABEL_ID = '01936b2e-7c4a-7000-8000-0000000000b1';
const A_DRINK = { name: 'Verre', color: 'MINT' } as const;
const rejects = () => Promise.reject(new TypeError('Failed to fetch'));

const COMMANDS = [
    'createCalendarLabel',
    'editCalendarLabel',
    'deleteCalendarLabel',
] as const;

function sendCommand(
    gateway: ServerActionCalendarLabelCommandGateway,
    command: (typeof COMMANDS)[number],
) {
    if (command === 'createCalendarLabel') {
        return gateway.createCalendarLabel(A_DRINK);
    }
    if (command === 'editCalendarLabel') {
        return gateway.editCalendarLabel(LABEL_ID, A_DRINK);
    }
    return gateway.deleteCalendarLabel(LABEL_ID);
}

describe('Feature: label commands through the server actions', () => {
    it('gives each action the form and the label id', async () => {
        const sent: string[] = [];
        const gateway = new ServerActionCalendarLabelCommandGateway({
            createCalendarLabel: (input) => {
                sent.push(`${input.name}|${input.color}`);
                return Promise.resolve(
                    ok({ calendarLabelId: LABEL_ID, ...input }),
                );
            },
            editCalendarLabel: (id, input) => {
                sent.push(`${id}|${input.name}`);
                return Promise.resolve(ok(null));
            },
            deleteCalendarLabel: (id) => {
                sent.push(id);
                return Promise.resolve(ok(null));
            },
        });

        for (const command of COMMANDS) {
            expect((await sendCommand(gateway, command)).success).toBe(true);
        }
        expect(sent).toEqual(['Verre|MINT', `${LABEL_ID}|Verre`, LABEL_ID]);
    });

    it.each(COMMANDS)(
        'gives a network error instead of rejecting for %s',
        async (command) => {
            const gateway = new ServerActionCalendarLabelCommandGateway({
                createCalendarLabel: rejects,
                editCalendarLabel: rejects,
                deleteCalendarLabel: rejects,
            });

            const result = await sendCommand(gateway, command);
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.NETWORK_ERROR,
            );
        },
    );
});
