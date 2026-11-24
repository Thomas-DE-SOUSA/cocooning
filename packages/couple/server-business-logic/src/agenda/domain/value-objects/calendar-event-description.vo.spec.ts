import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { CalendarEventDescription } from './calendar-event-description.vo';

describe('Feature: the description of a calendar event (R6)', () => {
    it('accepts exactly CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH signs', () => {
        const text = 'a'.repeat(CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH);
        expect(CalendarEventDescription.create(text)?.value).toBe(text);
    });

    it('refuses one sign too many', () => {
        const text = 'a'.repeat(CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH + 1);
        expect(() => CalendarEventDescription.create(text)).toThrow(
            expect.objectContaining({
                code: AgendaExceptionCodeEnum.CALENDAR_EVENT_DESCRIPTION_INVALID,
                context: { max: CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH },
            }),
        );
    });
});
