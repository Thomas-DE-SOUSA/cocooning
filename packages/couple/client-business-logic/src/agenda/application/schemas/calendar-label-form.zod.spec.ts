import { CALENDAR_LABEL_NAME_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { createCalendarLabelFormSchema } from './calendar-label-form.zod';

const schema = createCalendarLabelFormSchema((key) => `t:${key}`);
const SPORT = { name: 'Sport', color: 'SAGE' };

const issuesOf = (change: Record<string, unknown>) => {
    const result = schema.safeParse({ ...SPORT, ...change });
    return result.success
        ? []
        : result.error.issues.map(({ path, message }) => [
              path.join('.'),
              message,
          ]);
};

describe('Feature: the label typed in the agenda (R12)', () => {
    it('trims the name and keeps the colour', () => {
        expect(schema.parse({ ...SPORT, name: '  Sport ' })).toEqual(SPORT);
    });

    it('accepts the longest name', () => {
        expect(
            issuesOf({ name: 'a'.repeat(CALENDAR_LABEL_NAME_MAX_LENGTH) }),
        ).toEqual([]);
    });

    it.each([
        ['an empty name', { name: '  ' }, 'name', 'labelName.errors.required'],
        [
            'a name too long',
            { name: 'a'.repeat(CALENDAR_LABEL_NAME_MAX_LENGTH + 1) },
            'name',
            'labelName.errors.tooLong',
        ],
        ['no colour', { color: '' }, 'color', 'labelColor.errors.required'],
        [
            'a colour outside the palette',
            { color: 'RED' },
            'color',
            'labelColor.errors.required',
        ],
    ])(
        'refuses %s with its translated message (decision 0031)',
        (_label, change, path, key) => {
            expect(issuesOf(change)).toEqual([[path, `t:form.${key}`]]);
        },
    );
});
