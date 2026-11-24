import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import {
    type CalendarEventVisibility,
    CalendarEventVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { CalendarEventCreatedEvent } from '../../domain/events/calendar-event-created.event';
import { CalendarEventId } from '../../domain/value-objects/calendar-event-id.vo';
import { AgendaTestContext } from '../../__tests__/fixtures/agenda-test.context';
import {
    AS_A,
    COUPLE_ID,
    FIRST_ID,
    NOW,
    PARTNER_A,
    WEEKEND,
} from '../../__tests__/fixtures/agenda-test.data';

const SHARED = CalendarEventVisibilityEnum.SHARED;
const PRIVATE = CalendarEventVisibilityEnum.PRIVATE;

describe('Feature: create a calendar event', () => {
    let ctx: AgendaTestContext;

    beforeEach(() => {
        ctx = new AgendaTestContext();
    });
    afterEach(() => CalendarEventId.resetForTests());

    const create = (
        visibility: CalendarEventVisibility = SHARED,
        details = WEEKEND,
    ) =>
        ctx
            .createCalendarEventUseCase()
            .execute(AS_A, { ...details, visibility });

    describe('Scenario: R1, R3, a partner creates a shared event', () => {
        it('returns the event, owned by its author', async () => {
            await expect(
                create(SHARED, { ...WEEKEND, title: ' Week-end à Lyon ' }),
            ).resolves.toEqual({
                calendarEventId: FIRST_ID,
                ownerId: PARTNER_A,
                isOwner: true,
                title: 'Week-end à Lyon',
                description: 'Train de 8 h 12',
                startsOn: '2026-12-12',
                endsOn: '2026-12-13',
                startsAt: null,
                endsAt: null,
                visibility: SHARED,
                updatedAt: NOW,
            });
        });

        it('stores the event in its couple, at version 1', async () => {
            await create();
            expect(ctx.calendarEventRepository.storedSnapshots).toEqual([
                {
                    id: FIRST_ID,
                    coupleId: COUPLE_ID,
                    ownerId: PARTNER_A,
                    ...WEEKEND,
                    visibility: SHARED,
                    version: 1,
                    metadata: {
                        createdAt: NOW.toISOString(),
                        updatedAt: NOW.toISOString(),
                        deletedAt: null,
                    },
                },
            ]);
        });

        it('persists then publishes one created event, without its content', async () => {
            await create();
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000002',
                eventName: CalendarEventCreatedEvent.EVENT_NAME,
                aggregateId: FIRST_ID,
                context: AS_A,
                data: { ownerId: PARTNER_A, visibility: SHARED },
                occurredAt: NOW,
            };
            expect(ctx.calendarEventRepository.persistedEvents).toEqual([
                expected,
            ]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
            const published = JSON.stringify(ctx.eventPublisher.published);
            ['Lyon', 'Train', '2026-12-12'].forEach((content) =>
                expect(published).not.toContain(content),
            );
        });
    });

    describe('Scenario: R3, the author keeps the event "rien que pour moi"', () => {
        it('creates it private, and says so in its event', async () => {
            const view = await create(PRIVATE);
            expect(view.visibility).toBe(PRIVATE);
            expect(ctx.eventPublisher.published[0]?.data).toEqual({
                ownerId: PARTNER_A,
                visibility: PRIVATE,
            });
        });
    });

    describe('Scenario: R6, the description', () => {
        it.each([
            ['no description', null],
            ['a blank description', '  \n '],
        ])('stores %s as none', async (_label, description) => {
            const view = await create(SHARED, { ...WEEKEND, description });
            expect(view.description).toBeNull();
        });

        it('keeps the lines of the text, without the surrounding spaces', async () => {
            const description = ' Train de 8 h 12\nHôtel près de la gare ';
            const view = await create(SHARED, { ...WEEKEND, description });
            expect(view.description).toBe(description.trim());
        });
    });

    describe('Scenario: a detail breaks a rule', () => {
        it.each([
            ['R2, an empty title', { title: '  ' }, 'TITLE'],
            ['R2, a title too long', { title: 'a'.repeat(121) }, 'TITLE'],
            [
                'R6, a description too long',
                { description: 'a'.repeat(2001) },
                'DESCRIPTION',
            ],
            [
                'R5, a last day before the first',
                { endsOn: '2026-12-11' },
                'MOMENT',
            ],
        ] as const)(
            'refuses %s and stores nothing',
            async (_label, change, field) => {
                await expect(
                    create(SHARED, { ...WEEKEND, ...change }),
                ).rejects.toMatchObject({
                    code: AgendaExceptionCodeEnum[
                        `CALENDAR_EVENT_${field}_INVALID`
                    ],
                });
                expect(ctx.calendarEventRepository.storedSnapshots).toEqual([]);
                expect(ctx.eventPublisher.published).toEqual([]);
            },
        );
    });

    describe('Scenario: the in-process publication fails', () => {
        it('keeps the event and its domain event, and logs one warning', async () => {
            ctx.eventPublisher.failWith(new Error('bus down'));
            await create();
            expect(ctx.calendarEventRepository.storedSnapshots).toHaveLength(1);
            expect(ctx.calendarEventRepository.persistedEvents).toHaveLength(1);
            expect(ctx.logger.entries.map(({ level }) => level)).toEqual([
                'warn',
            ]);
        });
    });
});
