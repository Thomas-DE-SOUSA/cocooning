import { FLASH_MESSAGE_TEXT_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { createFlashMessageFormSchema } from './flash-message-form.zod';

const schema = createFlashMessageFormSchema((key) => `t:${key}`);

const issuesOf = (text: string) => {
    const result = schema.safeParse({ text });
    return result.success
        ? []
        : result.error.issues.map(({ path, message }) => [
              path.join('.'),
              message,
          ]);
};

describe('Feature: the flash message typed in the PWA (R2)', () => {
    it('trims the spaces around the text', () => {
        expect(schema.parse({ text: '  Je t aime  ' })).toEqual({
            text: 'Je t aime',
        });
    });

    it('accepts a text of the longest length, spaces around not counted', () => {
        expect(
            issuesOf(` ${'a'.repeat(FLASH_MESSAGE_TEXT_MAX_LENGTH)} `),
        ).toEqual([]);
    });

    it.each([
        ['an empty text', '', 'required'],
        ['spaces only', '   ', 'required'],
        [
            'a text one sign too long',
            'a'.repeat(FLASH_MESSAGE_TEXT_MAX_LENGTH + 1),
            'tooLong',
        ],
    ])(
        'refuses %s with its translated message (decision 0031)',
        (_label, text, type) => {
            expect(issuesOf(text)).toEqual([
                ['text', `t:form.text.errors.${type}`],
            ]);
        },
    );
});
