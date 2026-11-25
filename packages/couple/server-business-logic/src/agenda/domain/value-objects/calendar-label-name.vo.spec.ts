import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { CALENDAR_LABEL_NAME_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { CalendarLabelName } from './calendar-label-name.vo';

describe('Feature: the name of a calendar label (R12)', () => {
    it('keeps what the partner typed, without the surrounding spaces', () => {
        expect(CalendarLabelName.create('  Sport  ').value).toBe('Sport');
    });

    it('accepts exactly CALENDAR_LABEL_NAME_MAX_LENGTH signs', () => {
        const name = 'a'.repeat(CALENDAR_LABEL_NAME_MAX_LENGTH);
        expect(CalendarLabelName.create(name).value).toBe(name);
    });

    it.each([
        ['an empty name', ''],
        ['a name made of spaces', '   '],
        ['one sign too many', 'a'.repeat(CALENDAR_LABEL_NAME_MAX_LENGTH + 1)],
    ])('refuses %s', (_label, raw) => {
        expect(() => CalendarLabelName.create(raw)).toThrow(
            expect.objectContaining({
                code: AgendaExceptionCodeEnum.CALENDAR_LABEL_NAME_INVALID,
                context: { min: 1, max: CALENDAR_LABEL_NAME_MAX_LENGTH },
            }),
        );
    });
});
