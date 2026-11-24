import { NOTE_TITLE_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { createNoteTitleFormSchema } from './note-title-form.zod';

const schema = createNoteTitleFormSchema((key) => `t:${key}`);
const messagesOf = (title: string) => {
    const result = schema.safeParse({ title });
    return result.success
        ? []
        : result.error.issues.map(({ message }) => message);
};

describe('Feature: the title typed for a note (R8)', () => {
    it('keeps the title without its surrounding spaces', () => {
        expect(schema.parse({ title: '  Courses ' })).toEqual({
            title: 'Courses',
        });
    });

    it('accepts exactly NOTE_TITLE_MAX_LENGTH signs', () => {
        expect(messagesOf('a'.repeat(NOTE_TITLE_MAX_LENGTH))).toEqual([]);
    });

    it.each([
        ['an empty title', '', 't:form.title.errors.required'],
        ['a title made of spaces', '   ', 't:form.title.errors.required'],
        [
            'one sign too many',
            'a'.repeat(NOTE_TITLE_MAX_LENGTH + 1),
            't:form.title.errors.tooLong',
        ],
    ])(
        'refuses %s with its translated message (decision 0031)',
        (_label, title, message) => {
            expect(messagesOf(title)).toEqual([message]);
        },
    );
});
