import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { CALENDAR_EVENT_TITLE_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { CalendarEventTitle } from './calendar-event-title.vo';

describe('Feature: the title of a calendar event (R2)', () => {
    it('keeps what the partner typed, without the surrounding spaces', () => {
        expect(CalendarEventTitle.create('  Dîner  ').value).toBe('Dîner');
    });

    it('accepts exactly CALENDAR_EVENT_TITLE_MAX_LENGTH signs', () => {
        const title = 'a'.repeat(CALENDAR_EVENT_TITLE_MAX_LENGTH);
        expect(CalendarEventTitle.create(title).value).toBe(title);
    });

    it.each([
        ['an empty title', ''],
        ['a title made of spaces', '   '],
        ['one sign too many', 'a'.repeat(CALENDAR_EVENT_TITLE_MAX_LENGTH + 1)],
    ])('refuses %s', (_label, raw) => {
        expect(() => CalendarEventTitle.create(raw)).toThrow(
            expect.objectContaining({
                code: AgendaExceptionCodeEnum.CALENDAR_EVENT_TITLE_INVALID,
                context: { min: 1, max: CALENDAR_EVENT_TITLE_MAX_LENGTH },
            }),
        );
    });
});
