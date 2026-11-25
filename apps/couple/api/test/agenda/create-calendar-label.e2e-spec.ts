import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import {
    createTestCalendarLabels,
    readAgendaEvents,
} from '@cocooning/couple-e2e-shared/fixtures';
import { CalendarLabelCreatedEvent } from '@cocooning/couple-server-business-logic/agenda';
import { CALENDAR_LABEL_MAX_COUNT } from '@cocooning/couple-shared-kernel/limits';
import { AgendaTestApp } from './agenda-test-app';
import {
    calendarLabelOf,
    COUPLE_ID,
    NOW,
    OTHER_COUPLE_ID,
    PARTNER_A,
    SPORT,
    STRANGER,
} from './agenda-test-data';

const labelsOf = (coupleId: string, ownerId: string, deletedAt: Date | null) =>
    Array.from({ length: CALENDAR_LABEL_MAX_COUNT }, (_, index) => ({
        calendarLabelId: `01936b2e-7c4a-7000-8000-${String(index).padStart(10, '0')}${coupleId.slice(-2)}`,
        coupleId,
        ownerId,
        name: `Étiquette ${index}`,
        color: 'SAGE',
        createdAt: NOW,
        deletedAt,
    }));

describe('Feature: a partner creates a label of the couple (R12)', () => {
    const agenda = new AgendaTestApp();

    beforeAll(() => agenda.start());
    afterAll(() => agenda.stop());
    beforeEach(() => agenda.reset());

    describe('Scenario: a partner of a formed couple', () => {
        it('answers 201 with the label, its name trimmed', async () => {
            const response = await agenda.createLabel(PARTNER_A, {
                name: '  Sport ',
                color: 'SAGE',
            });
            expect(response).toEqual({
                status: 201,
                body: {
                    calendarLabelId: calendarLabelOf(response).calendarLabelId,
                    ...SPORT,
                    updatedAt: NOW.toISOString(),
                },
            });
        });

        it('writes its outbox row, without the name', async () => {
            const calendarLabelId = await agenda.createdLabelId(PARTNER_A);
            expect(
                await readAgendaEvents(agenda.prisma, calendarLabelId),
            ).toEqual([
                {
                    eventName: CalendarLabelCreatedEvent.EVENT_NAME,
                    coupleId: COUPLE_ID,
                    aggregateId: calendarLabelId,
                    userId: PARTNER_A,
                    version: 1,
                    published: false,
                    eventData: { ownerId: PARTNER_A, color: 'SAGE' },
                },
            ]);
        });
    });

    describe('Scenario: R12, CALENDAR_LABEL_MAX_COUNT labels already', () => {
        it('refuses one more with 409 CALENDAR_LABEL_LIMIT_REACHED', async () => {
            await createTestCalendarLabels(
                agenda.prisma,
                labelsOf(COUPLE_ID, PARTNER_A, null),
            );
            expect(await agenda.createLabel(PARTNER_A)).toEqual({
                status: 409,
                body: {
                    status: 409,
                    code: AgendaExceptionCodeEnum.CALENDAR_LABEL_LIMIT_REACHED,
                    message:
                        'The couple has as many calendar labels as allowed',
                    context: { max: CALENDAR_LABEL_MAX_COUNT },
                },
            });
        });

        it('counts neither the deleted labels nor those of another couple', async () => {
            await createTestCalendarLabels(agenda.prisma, [
                ...labelsOf(COUPLE_ID, PARTNER_A, NOW),
                ...labelsOf(OTHER_COUPLE_ID, STRANGER, null),
            ]);
            expect((await agenda.createLabel(PARTNER_A)).status).toBe(201);
        });
    });

    describe('Scenario: R12, a label that breaks the rule', () => {
        it('refuses an empty name with 422', async () => {
            const response = await agenda.createLabel(PARTNER_A, {
                name: '   ',
                color: 'SAGE',
            });
            expect(response.status).toBe(422);
        });

        it('refuses a colour outside the palette with 422', async () => {
            const response = await agenda.createLabel(PARTNER_A, {
                name: 'Sport',
                color: 'RED',
            });
            expect(response.status).toBe(422);
        });
    });
});
