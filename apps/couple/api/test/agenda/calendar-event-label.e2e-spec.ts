import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import {
    createTestCalendarLabels,
    readAgendaEvents,
} from '@cocooning/couple-e2e-shared/fixtures';
import { AgendaTestApp } from './agenda-test-app';
import {
    calendarEventOf,
    DINNER,
    NOW,
    OTHER_COUPLE_ID,
    PARTNER_A,
    PARTNER_B,
    PRIVATE_DINNER,
    refusal,
    STRANGER,
    UNKNOWN_CALENDAR_LABEL_ID,
    WEEKEND_DETAILS,
} from './agenda-test-data';

const LABEL_NOT_FOUND = refusal(
    404,
    AgendaExceptionCodeEnum.CALENDAR_LABEL_NOT_FOUND,
    'Calendar label not found',
);
const LABEL_OF_ANOTHER_COUPLE = {
    calendarLabelId: '01936b2e-7c4a-7000-8000-0000000001c1',
    coupleId: OTHER_COUPLE_ID,
    ownerId: STRANGER,
    name: 'Autre couple',
    color: 'MINT',
    createdAt: NOW,
    deletedAt: null,
};

describe('Feature: a label colours a calendar event (R13, R14)', () => {
    const agenda = new AgendaTestApp();

    beforeAll(() => agenda.start());
    afterAll(() => agenda.stop());
    beforeEach(() => agenda.reset());

    describe('Scenario: R13, a partner puts a label of the couple on an event', () => {
        it('creates the event with the label, then takes it off at an edit', async () => {
            const labelId = await agenda.createdLabelId(PARTNER_B);
            const created = await agenda.create(PARTNER_A, {
                ...DINNER,
                labelId,
            });
            expect(created.status).toBe(201);
            const { calendarEventId } = calendarEventOf(created);
            expect(
                (await agenda.get(PARTNER_B, calendarEventId)).body,
            ).toMatchObject({ labelId });
            const edited = await agenda.edit(PARTNER_B, calendarEventId, {
                ...WEEKEND_DETAILS,
                labelId: null,
            });
            expect(edited.body).toMatchObject({ labelId: null });
        });
    });

    describe('Scenario: R13, a label the couple does not have', () => {
        it('answers 404 for the label of another couple, at creation and at an edit', async () => {
            await createTestCalendarLabels(agenda.prisma, [
                LABEL_OF_ANOTHER_COUPLE,
            ]);
            const labelId = LABEL_OF_ANOTHER_COUPLE.calendarLabelId;
            expect(
                await agenda.create(PARTNER_A, { ...DINNER, labelId }),
            ).toEqual(LABEL_NOT_FOUND);
            const calendarEventId = await agenda.createdId(PARTNER_A, DINNER);
            expect(
                await agenda.edit(PARTNER_A, calendarEventId, {
                    ...WEEKEND_DETAILS,
                    labelId,
                }),
            ).toEqual(LABEL_NOT_FOUND);
            expect(await agenda.prisma.current.calendarEvent.count()).toBe(1);
        });

        it('answers 404 for an unknown or a deleted label', async () => {
            const labelId = await agenda.createdLabelId(PARTNER_A);
            await agenda.deleteLabel(PARTNER_A, labelId);
            expect(
                await agenda.create(PARTNER_A, { ...DINNER, labelId }),
            ).toEqual(LABEL_NOT_FOUND);
            expect(
                await agenda.create(PARTNER_A, {
                    ...DINNER,
                    labelId: UNKNOWN_CALENDAR_LABEL_ID,
                }),
            ).toEqual(LABEL_NOT_FOUND);
        });
    });

    describe('Scenario: R14, a partner deletes a label that events carry', () => {
        it('keeps the events, without the label, their versions untouched', async () => {
            const labelId = await agenda.createdLabelId(PARTNER_A);
            const keptId = await agenda.createdLabelId(PARTNER_A, {
                name: 'Soirée',
                color: 'ROSE',
            });
            const sharedId = await agenda.createdId(PARTNER_A, {
                ...DINNER,
                labelId,
            });
            const privateId = await agenda.createdId(PARTNER_B, {
                ...PRIVATE_DINNER,
                labelId,
            });
            const otherId = await agenda.createdId(PARTNER_A, {
                ...DINNER,
                labelId: keptId,
            });
            expect((await agenda.deleteLabel(PARTNER_A, labelId)).status).toBe(
                204,
            );
            const labelOf = async (userId: string, id: string) =>
                calendarEventOf(await agenda.get(userId, id)).labelId;
            expect(await labelOf(PARTNER_A, sharedId)).toBeNull();
            expect(await labelOf(PARTNER_B, privateId)).toBeNull();
            expect(await labelOf(PARTNER_A, otherId)).toBe(keptId);
            const events = await readAgendaEvents(agenda.prisma, sharedId);
            expect(events).toHaveLength(1);
            const rows = await agenda.prisma.current.calendarEvent.findMany({
                where: { id: { in: [sharedId, privateId] } },
                select: { version: true },
            });
            expect(rows).toEqual([{ version: 1 }, { version: 1 }]);
        });
    });
});
