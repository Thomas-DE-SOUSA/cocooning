import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_CALENDAR_EVENT_LIST,
    A_SHARED_CALENDAR_EVENT,
} from '@cocooning/couple-client-business-logic/testing';
import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { CalendarEventVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { createCoupleHttpConfig } from '../../couple-http-config';
import { resolveAgendaEndpoints } from '../endpoints/agenda.endpoints';
import { ApiAgendaGateway } from './api-agenda.gateway';

const EVENT_ID = A_SHARED_CALENDAR_EVENT.calendarEventId;
const SESSION_COOKIE = { Cookie: 'cocooning_session=session-token-1' };
const ACCEPT = { Accept: 'application/json' };
const JSON_BODY = { ...ACCEPT, 'Content-Type': 'application/json' };
const DETAILS = {
    title: 'Diner chez Lea',
    description: null,
    startsOn: '2026-12-05',
    endsOn: null,
    startsAt: '20:00',
    endsAt: '23:00',
};

const aGateway = (token: string | null = 'session-token-1') =>
    new ApiAgendaGateway(
        resolveAgendaEndpoints('http://api.test'),
        createCoupleHttpConfig(5000),
        () => Promise.resolve(token),
    );

describe('Feature: the PWA reaches the agenda through the API', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    describe('Scenario: each action for the signed-in partner', () => {
        it('lists a range of days with the session cookie', async () => {
            fakeFetch.givenResponse(200, JSON.stringify(A_CALENDAR_EVENT_LIST));
            await expect(
                aGateway().listCalendarEvents({
                    from: '2026-11-30',
                    to: '2027-01-03',
                }),
            ).resolves.toEqual(ok(A_CALENDAR_EVENT_LIST));
            expect(fakeFetch.calls).toEqual([
                {
                    url: 'http://api.test/calendar-events?from=2026-11-30&to=2027-01-03',
                    method: 'GET',
                    headers: { ...ACCEPT, ...SESSION_COOKIE },
                    body: null,
                },
            ]);
        });

        it('creates with its visibility and edits with the whole form (R3, R9)', async () => {
            fakeFetch.givenResponse(
                200,
                JSON.stringify(A_SHARED_CALENDAR_EVENT),
            );
            const visibility = CalendarEventVisibilityEnum.SHARED;
            await aGateway().createCalendarEvent({
                ...DETAILS,
                title: ' Diner chez Lea ',
                visibility,
            });
            await aGateway().editCalendarEvent(EVENT_ID, DETAILS);
            expect(fakeFetch.calls).toEqual([
                {
                    url: 'http://api.test/calendar-events',
                    method: 'POST',
                    headers: { ...JSON_BODY, ...SESSION_COOKIE },
                    body: JSON.stringify({ ...DETAILS, visibility }),
                },
                {
                    url: `http://api.test/calendar-events/${EVENT_ID}`,
                    method: 'PATCH',
                    headers: { ...JSON_BODY, ...SESSION_COOKIE },
                    body: JSON.stringify(DETAILS),
                },
            ]);
        });

        it.each([
            [
                'opens',
                'getCalendarEvent',
                'GET',
                `/calendar-events/${EVENT_ID}`,
            ],
            [
                'shares',
                'shareCalendarEvent',
                'POST',
                `/calendar-events/${EVENT_ID}/share`,
            ],
            [
                'makes private',
                'makeCalendarEventPrivate',
                'POST',
                `/calendar-events/${EVENT_ID}/make-private`,
            ],
        ] as const)('%s an event', async (_label, operation, method, path) => {
            fakeFetch.givenResponse(
                200,
                JSON.stringify(A_SHARED_CALENDAR_EVENT),
            );
            await expect(aGateway()[operation](EVENT_ID)).resolves.toEqual(
                ok(A_SHARED_CALENDAR_EVENT),
            );
            expect(fakeFetch.calls[0]).toMatchObject({
                url: `http://api.test${path}`,
                method,
            });
        });

        it('deletes an event from a 204 without body (R9)', async () => {
            fakeFetch.givenResponse(204, '');
            await expect(
                aGateway().deleteCalendarEvent(EVENT_ID),
            ).resolves.toEqual(ok(null));
            expect(fakeFetch.calls[0]).toMatchObject({
                url: `http://api.test/calendar-events/${EVENT_ID}`,
                method: 'DELETE',
            });
        });
    });

    describe('Scenario: R8, the API reserves the visibility to the author', () => {
        it('returns FORBIDDEN with the backend code', async () => {
            const code =
                AgendaExceptionCodeEnum.CALENDAR_EVENT_RESERVED_TO_OWNER;
            const message = 'Reserved to the owner of the calendar event';
            fakeFetch.givenResponse(
                403,
                JSON.stringify({ status: 403, code, message, context: null }),
            );
            await expect(
                aGateway().makeCalendarEventPrivate(EVENT_ID),
            ).resolves.toEqual(
                fail({
                    code: ApiErrorCodeEnum.FORBIDDEN,
                    message,
                    backendCode: code,
                }),
            );
        });
    });

    describe('Scenario: a request outside the contract or without session', () => {
        it.each([
            [
                'an empty title',
                () =>
                    aGateway().createCalendarEvent({
                        ...DETAILS,
                        title: ' ',
                        visibility: CalendarEventVisibilityEnum.SHARED,
                    }),
            ],
            [
                'an hour that is not HH:MM',
                () =>
                    aGateway().editCalendarEvent(EVENT_ID, {
                        ...DETAILS,
                        startsAt: '8h',
                    }),
            ],
            [
                'a range that is not two days',
                () => aGateway().listCalendarEvents({ from: 'today', to: '' }),
            ],
        ])('refuses %s without calling the API', async (_label, send) => {
            const result = await send();
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.VALIDATION_ERROR,
            );
            expect(fakeFetch.calls).toEqual([]);
        });

        it('refuses without calling the API when there is no session', async () => {
            const result = await aGateway(null).getCalendarEvent(EVENT_ID);
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.UNAUTHORIZED,
            );
            expect(fakeFetch.calls).toEqual([]);
        });
    });
});
