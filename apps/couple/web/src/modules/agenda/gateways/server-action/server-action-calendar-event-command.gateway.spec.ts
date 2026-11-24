import type { CalendarEventForm } from '@cocooning/couple-client-business-logic/agenda';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { ok } from '@cocooning/shared-kernel/utils';
import { ServerActionCalendarEventCommandGateway } from './server-action-calendar-event-command.gateway';

const EVENT_ID = '01936b2e-7c4a-7000-8000-0000000000e1';
const A_DINNER: CalendarEventForm = {
    title: 'Dîner chez Léa',
    description: null,
    startsOn: '2026-12-05',
    endsOn: null,
    startsAt: '20:00',
    endsAt: null,
    isPrivate: false,
};
const rejects = () => Promise.reject(new TypeError('Failed to fetch'));

const COMMANDS = [
    'createCalendarEvent',
    'editCalendarEvent',
    'shareCalendarEvent',
    'makeCalendarEventPrivate',
    'deleteCalendarEvent',
] as const;

function sendCommand(
    gateway: ServerActionCalendarEventCommandGateway,
    command: (typeof COMMANDS)[number],
) {
    if (command === 'createCalendarEvent') {
        return gateway.createCalendarEvent(A_DINNER);
    }
    if (command === 'editCalendarEvent') {
        return gateway.editCalendarEvent(EVENT_ID, A_DINNER);
    }
    return gateway[command](EVENT_ID);
}

describe('Feature: calendar event commands through the server actions', () => {
    it('gives each action what the inputs held, a missing part as an empty input', async () => {
        const sent: string[] = [];
        const record = (input: string) => {
            sent.push(input);
            return Promise.resolve(ok(null));
        };
        const gateway = new ServerActionCalendarEventCommandGateway({
            createCalendarEvent: (input) =>
                record(`${input.title}|${input.endsOn}|${input.startsAt}`),
            editCalendarEvent: (id, input) => record(`${id}|${input.endsAt}`),
            shareCalendarEvent: record,
            makeCalendarEventPrivate: record,
            deleteCalendarEvent: record,
        });

        for (const command of COMMANDS) {
            await expect(sendCommand(gateway, command)).resolves.toEqual(
                ok(null),
            );
        }
        expect(sent).toEqual([
            'Dîner chez Léa||20:00',
            `${EVENT_ID}|`,
            EVENT_ID,
            EVENT_ID,
            EVENT_ID,
        ]);
    });

    it.each(COMMANDS)(
        'gives a network error instead of rejecting for %s',
        async (command) => {
            const gateway = new ServerActionCalendarEventCommandGateway({
                createCalendarEvent: rejects,
                editCalendarEvent: rejects,
                shareCalendarEvent: rejects,
                makeCalendarEventPrivate: rejects,
                deleteCalendarEvent: rejects,
            });

            const result = await sendCommand(gateway, command);
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.NETWORK_ERROR,
            );
        },
    );
});
