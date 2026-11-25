import {
    CARD_FIELD_VALUE_MAX_LENGTH,
    NOTE_CARD_QUERY_MAX_LENGTH,
    NOTE_TITLE_MAX_LENGTH,
} from '@cocooning/couple-shared-kernel/limits';
import { createNoteCardFieldFormSchema } from './note-card-field-form.zod';
import { createNoteCardNameFormSchema } from './note-card-name-form.zod';
import { createNoteCardQueryFormSchema } from './note-card-query-form.zod';

const t = (key: string) => `t:${key}`;
const FORMS = [
    ['name', createNoteCardNameFormSchema(t), NOTE_TITLE_MAX_LENGTH, 'R19'],
    [
        'query',
        createNoteCardQueryFormSchema(t),
        NOTE_CARD_QUERY_MAX_LENGTH,
        'R19',
    ],
    [
        'value',
        createNoteCardFieldFormSchema(t),
        CARD_FIELD_VALUE_MAX_LENGTH,
        'R22',
    ],
] as const;

describe.each(FORMS)(
    'Feature: the %s typed on a note card',
    (field, schema, maxLength, rule) => {
        const messagesOf = (text: string) => {
            const result = schema.safeParse({ [field]: text });
            return result.success
                ? []
                : result.error.issues.map(({ message }) => message);
        };

        it(`keeps the text without its surrounding spaces (${rule})`, () => {
            expect(schema.parse({ [field]: '  Chez Paul ' })).toEqual({
                [field]: 'Chez Paul',
            });
        });

        it('accepts exactly its maximum length', () => {
            expect(messagesOf('a'.repeat(maxLength))).toEqual([]);
        });

        it.each([
            ['an empty text', '', 'required'],
            ['a text made of spaces', '   ', 'required'],
            ['one sign too many', 'a'.repeat(maxLength + 1), 'tooLong'],
        ])(
            'refuses %s with its translated message (decision 0031)',
            (_label, text, error) => {
                expect(messagesOf(text)).toEqual([
                    `t:form.${field}.errors.${error}`,
                ]);
            },
        );
    },
);
