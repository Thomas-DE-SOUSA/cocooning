import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { readAgendaEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { CalendarEventCreatedEvent } from '@cocooning/couple-server-business-logic/agenda';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { AgendaTestApp } from './agenda-test-app';
import {
    ALONE,
    calendarEventOf,
    COUPLE_ID,
    NOW,
    PARTNER_A,
    refusal,
    WEEKEND,
} from './agenda-test-data';

describe('Feature: a partner creates a calendar event (R1, R3)', () => {
    const agenda = new AgendaTestApp();

    beforeAll(() => agenda.start());
    afterAll(() => agenda.stop());
    beforeEach(() => agenda.reset());

    describe('Scenario: a partner of a formed couple', () => {
        it('answers 201 with the event, owned by its author', async () => {
            const response = await agenda.create(PARTNER_A, {
                ...WEEKEND,
                title: ' Week-end à Lyon ',
            });
            expect(response).toEqual({
                status: 201,
                body: {
                    calendarEventId: calendarEventOf(response).calendarEventId,
                    ownerId: PARTNER_A,
                    isOwner: true,
                    ...WEEKEND,
                    updatedAt: NOW.toISOString(),
                },
            });
        });

        it('writes its outbox row, without the title, the description or the days', async () => {
            const calendarEventId = await agenda.createdId(PARTNER_A, WEEKEND);
            expect(
                await readAgendaEvents(agenda.prisma, calendarEventId),
            ).toEqual([
                {
                    eventName: CalendarEventCreatedEvent.EVENT_NAME,
                    coupleId: COUPLE_ID,
                    aggregateId: calendarEventId,
                    userId: PARTNER_A,
                    version: 1,
                    published: false,
                    eventData: { ownerId: PARTNER_A, visibility: 'SHARED' },
                },
            ]);
        });

        it('keeps the event "rien que pour moi" when asked at creation', async () => {
            const response = await agenda.create(PARTNER_A, {
                ...WEEKEND,
                visibility: 'PRIVATE',
            });
            expect(calendarEventOf(response).visibility).toBe('PRIVATE');
        });
    });

    describe('Scenario: R5, an end hour without a start hour', () => {
        it('refuses with 422 CALENDAR_EVENT_MOMENT_INVALID', async () => {
            const response = await agenda.create(PARTNER_A, {
                ...WEEKEND,
                endsOn: null,
                endsAt: '22:00',
            });
            expect(response).toEqual(
                refusal(
                    422,
                    AgendaExceptionCodeEnum.CALENDAR_EVENT_MOMENT_INVALID,
                    'Invalid calendar event moment',
                ),
            );
        });
    });

    describe('Scenario: R2, a body the contract refuses', () => {
        it('refuses an empty title with 422', async () => {
            const response = await agenda.create(PARTNER_A, {
                ...WEEKEND,
                title: '  ',
            });
            expect(response.status).toBe(422);
        });
    });

    describe('Scenario: R4, a partner without a formed couple', () => {
        it('refuses with 404 CALENDAR_EVENT_COUPLE_NOT_PAIRED', async () => {
            expect(await agenda.create(ALONE)).toEqual(
                refusal(
                    404,
                    AgendaExceptionCodeEnum.CALENDAR_EVENT_COUPLE_NOT_PAIRED,
                    'The agenda needs a formed couple',
                ),
            );
        });
    });

    describe('Scenario: no session cookie', () => {
        it('refuses with 401', async () => {
            const response = await agenda
                .unauthenticated()
                .post(ApiRouterEnum.CALENDAR_EVENT_CREATE, WEEKEND);
            expect(response).toEqual(
                refusal(
                    401,
                    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING,
                    'Session missing',
                ),
            );
        });
    });
});
