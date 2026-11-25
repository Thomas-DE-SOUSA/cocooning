import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { CalendarLabelColorEnum } from '@cocooning/couple-shared-kernel/enums';
import { CALENDAR_LABEL_MAX_COUNT } from '@cocooning/couple-shared-kernel/limits';
import { CalendarLabelCreatedEvent } from '../../domain/events/calendar-label-created.event';
import { CalendarEventId } from '../../domain/value-objects/calendar-event-id.vo';
import { AgendaTestContext } from '../../__tests__/fixtures/agenda-test.context';
import {
    AS_A,
    AS_STRANGER,
    COUPLE_ID,
    FIRST_ID,
    NOW,
    PARTNER_A,
} from '../../__tests__/fixtures/agenda-test.data';

const ROSE = CalendarLabelColorEnum.ROSE;

describe('Feature: create a calendar label (R12)', () => {
    let ctx: AgendaTestContext;

    beforeEach(() => {
        ctx = new AgendaTestContext();
    });
    afterEach(() => CalendarEventId.resetForTests());

    const create = (name = ' Soirée ', context = AS_A) =>
        ctx
            .createCalendarLabelUseCase()
            .execute(context, { name, color: ROSE });

    const givenLabels = (count: number, context = AS_A) =>
        Array.from({ length: count }, (_, index) =>
            ctx.givenLabelOf(context, `Étiquette ${index}`),
        );

    describe('Scenario: a partner adds a label to the couple', () => {
        it('returns the label, its name trimmed', async () => {
            await expect(create()).resolves.toEqual({
                calendarLabelId: FIRST_ID,
                name: 'Soirée',
                color: ROSE,
                updatedAt: NOW,
            });
        });

        it('stores it in its couple, at version 1, its creator as owner', async () => {
            await create();
            expect(ctx.calendarLabelRepository.storedSnapshots).toEqual([
                {
                    id: FIRST_ID,
                    coupleId: COUPLE_ID,
                    ownerId: PARTNER_A,
                    name: 'Soirée',
                    color: ROSE,
                    version: 1,
                    metadata: {
                        createdAt: NOW.toISOString(),
                        updatedAt: NOW.toISOString(),
                        deletedAt: null,
                    },
                },
            ]);
        });

        it('persists then publishes one created event, without the name', async () => {
            await create();
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000002',
                eventName: CalendarLabelCreatedEvent.EVENT_NAME,
                aggregateId: FIRST_ID,
                context: AS_A,
                data: { ownerId: PARTNER_A, color: ROSE },
                occurredAt: NOW,
            };
            expect(ctx.calendarLabelRepository.persistedEvents).toEqual([
                expected,
            ]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
            expect(JSON.stringify(ctx.eventPublisher.published)).not.toContain(
                'Soirée',
            );
        });
    });

    describe('Scenario: R12, the couple has CALENDAR_LABEL_MAX_COUNT labels', () => {
        it('accepts the last one allowed', async () => {
            givenLabels(CALENDAR_LABEL_MAX_COUNT - 1);
            await create();
            expect(ctx.calendarLabelRepository.storedSnapshots).toHaveLength(
                CALENDAR_LABEL_MAX_COUNT,
            );
        });

        it('refuses one more and stores nothing', async () => {
            givenLabels(CALENDAR_LABEL_MAX_COUNT);
            await expect(create()).rejects.toMatchObject({
                code: AgendaExceptionCodeEnum.CALENDAR_LABEL_LIMIT_REACHED,
                context: { max: CALENDAR_LABEL_MAX_COUNT },
            });
            expect(ctx.calendarLabelRepository.storedSnapshots).toHaveLength(
                CALENDAR_LABEL_MAX_COUNT,
            );
            expect(ctx.eventPublisher.published).toEqual([]);
        });

        it('counts neither the deleted labels nor those of another couple', async () => {
            givenLabels(CALENDAR_LABEL_MAX_COUNT, AS_STRANGER);
            const [deleted] = givenLabels(CALENDAR_LABEL_MAX_COUNT);
            await ctx.deleteCalendarLabelUseCase().execute(AS_A, {
                calendarLabelId: deleted?.id.getValue() ?? '',
            });
            await expect(create()).resolves.toMatchObject({ name: 'Soirée' });
        });
    });

    describe('Scenario: R12, a name that breaks the rule', () => {
        it.each([
            ['an empty name', '  '],
            ['a name too long', 'a'.repeat(31)],
        ])('refuses %s and stores nothing', async (_label, name) => {
            await expect(create(name)).rejects.toMatchObject({
                code: AgendaExceptionCodeEnum.CALENDAR_LABEL_NAME_INVALID,
            });
            expect(ctx.calendarLabelRepository.storedSnapshots).toEqual([]);
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: the in-process publication fails', () => {
        it('keeps the label and its domain event, and logs one warning', async () => {
            ctx.eventPublisher.failWith(new Error('bus down'));
            await create();
            expect(ctx.calendarLabelRepository.storedSnapshots).toHaveLength(1);
            expect(ctx.calendarLabelRepository.persistedEvents).toHaveLength(1);
            expect(ctx.logger.entries.map(({ level }) => level)).toEqual([
                'warn',
            ]);
        });
    });
});
