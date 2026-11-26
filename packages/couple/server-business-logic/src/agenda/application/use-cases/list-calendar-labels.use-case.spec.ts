import { CalendarLabelColorEnum } from '@cocooning/couple-shared-kernel/enums';
import { CalendarEventId } from '../../domain/value-objects/calendar-event-id.vo';
import { AgendaTestContext } from '../../__tests__/fixtures/agenda-test.context';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    MILLISECONDS_PER_HOUR,
    NOW,
} from '../../__tests__/fixtures/agenda-test.data';

const LATER = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);

describe('Feature: list the calendar labels of the couple (R12)', () => {
    let ctx: AgendaTestContext;

    beforeEach(() => {
        ctx = new AgendaTestContext();
    });
    afterEach(() => CalendarEventId.resetForTests());

    it('gives both partners the same labels, in creation order', async () => {
        const sport = ctx.givenLabelOf(AS_B, 'Sport');
        ctx.advanceHours(1);
        const soiree = ctx.givenLabelOf(
            AS_A,
            'Soirée',
            CalendarLabelColorEnum.ROSE,
        );
        const expected = [
            {
                calendarLabelId: sport.id.getValue(),
                name: 'Sport',
                color: CalendarLabelColorEnum.SAGE,
                updatedAt: NOW,
            },
            {
                calendarLabelId: soiree.id.getValue(),
                name: 'Soirée',
                color: CalendarLabelColorEnum.ROSE,
                updatedAt: LATER,
            },
        ];
        await expect(
            ctx.listCalendarLabelsUseCase().execute(AS_A),
        ).resolves.toEqual(expected);
        await expect(
            ctx.listCalendarLabelsUseCase().execute(AS_B),
        ).resolves.toEqual(expected);
    });

    it('gives another couple none of them (core.md rule 27)', async () => {
        ctx.givenLabelOf(AS_A);
        await expect(
            ctx.listCalendarLabelsUseCase().execute(AS_STRANGER),
        ).resolves.toEqual([]);
    });
});
