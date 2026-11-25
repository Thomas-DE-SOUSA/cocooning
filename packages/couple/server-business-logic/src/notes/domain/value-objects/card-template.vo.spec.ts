import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    CARD_FIELD_NAME_MAX_LENGTH,
    CARD_TEMPLATE_MAX_FIELDS,
} from '@cocooning/couple-shared-kernel/limits';
import { CardTemplate } from './card-template.vo';

const fields = (count: number): string[] =>
    Array.from({ length: count }, (_, index) => `Case ${index}`);

describe('Feature: the card template of a smart folder (R17)', () => {
    it('keeps the fields in order, without the surrounding spaces', () => {
        expect(CardTemplate.create([' Adresse ', 'Prix']).fieldNames).toEqual([
            'Adresse',
            'Prix',
        ]);
    });

    it('accepts exactly CARD_TEMPLATE_MAX_FIELDS fields of CARD_FIELD_NAME_MAX_LENGTH signs', () => {
        const names = [
            'a'.repeat(CARD_FIELD_NAME_MAX_LENGTH),
            ...fields(CARD_TEMPLATE_MAX_FIELDS - 1),
        ];
        expect(CardTemplate.create(names).fieldNames).toEqual(names);
    });

    it.each([
        ['no field', []],
        ['one field too many', fields(CARD_TEMPLATE_MAX_FIELDS + 1)],
        ['an empty field', ['Adresse', '  ']],
        [
            'a field one sign too long',
            ['a'.repeat(CARD_FIELD_NAME_MAX_LENGTH + 1)],
        ],
        [
            'twice the same field, whatever the case',
            ['Prix', 'Adresse', 'prix'],
        ],
    ])('refuses %s', (_label, raw) => {
        expect(() => CardTemplate.create(raw)).toThrow(
            expect.objectContaining({
                code: NoteExceptionCodeEnum.CARD_TEMPLATE_INVALID,
                context: {
                    maxFields: CARD_TEMPLATE_MAX_FIELDS,
                    maxLength: CARD_FIELD_NAME_MAX_LENGTH,
                },
            }),
        );
    });
});
