import {
    CARD_FIELD_NAME_MAX_LENGTH,
    CARD_TEMPLATE_MAX_FIELDS,
    FOLDER_SUBJECT_MAX_LENGTH,
} from '@cocooning/couple-shared-kernel/limits';
import {
    createFolderTemplateFormSchema,
    createSmartFolderFormSchema,
} from './folder-template-form.zod';

const t = (key: string) => `t:${key}`;
const schema = createFolderTemplateFormSchema(t);
const SUBJECT = 'Les restaurants à essayer';
const FIELDS = ['Adresse', 'Cuisine', 'Prix'];
const fieldsOf = (count: number): string[] =>
    Array.from({ length: count }, (_, index) => `Case ${index}`);
const messagesOf = (subject: string, fields: string[]) => {
    const result = schema.safeParse({ subject, fields });
    return result.success
        ? []
        : result.error.issues.map(({ message }) => message);
};

describe('Feature: the subject and the fields typed for a smart folder (R17)', () => {
    it('keeps the subject and the fields without their surrounding spaces', () => {
        expect(
            schema.parse({
                subject: ` ${SUBJECT} `,
                fields: [' Adresse ', 'Prix'],
            }),
        ).toEqual({ subject: SUBJECT, fields: ['Adresse', 'Prix'] });
    });

    it('accepts the bounds exactly', () => {
        const fields = [
            'a'.repeat(CARD_FIELD_NAME_MAX_LENGTH),
            ...fieldsOf(CARD_TEMPLATE_MAX_FIELDS - 1),
        ];
        expect(
            messagesOf('a'.repeat(FOLDER_SUBJECT_MAX_LENGTH), fields),
        ).toEqual([]);
    });

    it.each([
        ['an empty subject', ' ', FIELDS, 't:form.subject.errors.required'],
        [
            'a subject one sign too long',
            'a'.repeat(FOLDER_SUBJECT_MAX_LENGTH + 1),
            FIELDS,
            't:form.subject.errors.tooLong',
        ],
        ['no field', SUBJECT, [], 't:form.fields.errors.required'],
        [
            'an empty field',
            SUBJECT,
            ['Prix', ' '],
            't:form.fields.errors.required',
        ],
        [
            'a field one sign too long',
            SUBJECT,
            ['a'.repeat(CARD_FIELD_NAME_MAX_LENGTH + 1)],
            't:form.fields.errors.tooLong',
        ],
        [
            'one field too many',
            SUBJECT,
            fieldsOf(CARD_TEMPLATE_MAX_FIELDS + 1),
            't:form.fields.errors.tooMany',
        ],
        [
            'twice the same field, whatever the case',
            SUBJECT,
            ['Prix', ' prix'],
            't:form.fields.errors.duplicate',
        ],
    ])(
        'refuses %s with its translated message (decision 0031)',
        (_label, subject, fields, message) => {
            expect(messagesOf(subject, fields)).toEqual([message]);
        },
    );

    it('reads the name of a new smart folder with its subject and fields (R13)', () => {
        expect(
            createSmartFolderFormSchema(t).parse({
                name: ' Restaurants ',
                subject: SUBJECT,
                fields: FIELDS,
            }),
        ).toEqual({ name: 'Restaurants', subject: SUBJECT, fields: FIELDS });
    });
});
