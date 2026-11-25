import { FOLDER_NAME_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { createFolderNameFormSchema } from './folder-name-form.zod';

const schema = createFolderNameFormSchema((key) => `t:${key}`);
const messagesOf = (name: string) => {
    const result = schema.safeParse({ name });
    return result.success
        ? []
        : result.error.issues.map(({ message }) => message);
};

describe('Feature: the name typed for a folder (R13)', () => {
    it('keeps the name without its surrounding spaces', () => {
        expect(schema.parse({ name: '  Vacances ' })).toEqual({
            name: 'Vacances',
        });
    });

    it('accepts exactly FOLDER_NAME_MAX_LENGTH signs', () => {
        expect(messagesOf('a'.repeat(FOLDER_NAME_MAX_LENGTH))).toEqual([]);
    });

    it.each([
        ['an empty name', '', 't:form.name.errors.required'],
        ['a name made of spaces', '   ', 't:form.name.errors.required'],
        [
            'one sign too many',
            'a'.repeat(FOLDER_NAME_MAX_LENGTH + 1),
            't:form.name.errors.tooLong',
        ],
    ])(
        'refuses %s with its translated message (decision 0031)',
        (_label, name, message) => {
            expect(messagesOf(name)).toEqual([message]);
        },
    );
});
