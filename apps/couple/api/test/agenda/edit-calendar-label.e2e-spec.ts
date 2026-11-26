import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { readAgendaEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { CalendarLabelEditedEvent } from '@cocooning/couple-server-business-logic/agenda';
import { AgendaTestApp } from './agenda-test-app';
import {
    COUPLE_ID,
    NOW,
    PARTNER_A,
    PARTNER_B,
    refusal,
    STRANGER,
    UNKNOWN_CALENDAR_LABEL_ID,
} from './agenda-test-data';

const EDITED_AT = new Date(NOW.getTime() + 60_000);
const YOGA = { name: 'Yoga', color: 'PLUM' };
const NOT_FOUND = refusal(
    404,
    AgendaExceptionCodeEnum.CALENDAR_LABEL_NOT_FOUND,
    'Calendar label not found',
);

describe('Feature: a partner renames and recolours a label (R12)', () => {
    const agenda = new AgendaTestApp();

    beforeAll(() => agenda.start());
    afterAll(() => agenda.stop());
    beforeEach(() => agenda.reset());

    describe('Scenario: the other partner edits a label of the couple', () => {
        it('answers 200 with the new name and colour', async () => {
            const calendarLabelId = await agenda.createdLabelId(PARTNER_A);
            agenda.clock.setNow(EDITED_AT);
            expect(
                await agenda.editLabel(PARTNER_B, calendarLabelId, YOGA),
            ).toEqual({
                status: 200,
                body: {
                    calendarLabelId,
                    ...YOGA,
                    updatedAt: EDITED_AT.toISOString(),
                },
            });
        });

        it('appends an edited row to the outbox, with the colour only', async () => {
            const calendarLabelId = await agenda.createdLabelId(PARTNER_A);
            await agenda.editLabel(PARTNER_B, calendarLabelId, YOGA);
            const events = await readAgendaEvents(
                agenda.prisma,
                calendarLabelId,
            );
            expect(events[1]).toEqual({
                eventName: CalendarLabelEditedEvent.EVENT_NAME,
                coupleId: COUPLE_ID,
                aggregateId: calendarLabelId,
                userId: PARTNER_B,
                version: 2,
                published: false,
                eventData: { color: 'PLUM' },
            });
        });
    });

    describe('Scenario: R13, a label the partner cannot reach', () => {
        it('answers 404 to another couple, and changes nothing', async () => {
            const calendarLabelId = await agenda.createdLabelId(PARTNER_A);
            expect(
                await agenda.editLabel(STRANGER, calendarLabelId, YOGA),
            ).toEqual(NOT_FOUND);
            expect((await agenda.listLabels(PARTNER_A)).body).toMatchObject({
                items: [{ name: 'Sport', color: 'SAGE' }],
            });
        });

        it('answers 404 for an unknown or a deleted label', async () => {
            const calendarLabelId = await agenda.createdLabelId(PARTNER_A);
            await agenda.deleteLabel(PARTNER_A, calendarLabelId);
            expect(
                await agenda.editLabel(PARTNER_B, calendarLabelId, YOGA),
            ).toEqual(NOT_FOUND);
            expect(
                await agenda.editLabel(
                    PARTNER_B,
                    UNKNOWN_CALENDAR_LABEL_ID,
                    YOGA,
                ),
            ).toEqual(NOT_FOUND);
        });
    });

    describe('Scenario: R12, an empty name or an identifier that is not one', () => {
        it('refuses with 422', async () => {
            const calendarLabelId = await agenda.createdLabelId(PARTNER_A);
            const emptyName = await agenda.editLabel(
                PARTNER_A,
                calendarLabelId,
                {
                    ...YOGA,
                    name: ' ',
                },
            );
            const badId = await agenda.editLabel(PARTNER_A, 'sport', YOGA);
            expect([emptyName.status, badId.status]).toEqual([422, 422]);
        });
    });
});
