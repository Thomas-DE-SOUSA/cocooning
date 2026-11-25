import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { CARD_FIELD_VALUE_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { NoteException } from '../exceptions/note.exception';
import { sameFieldName } from '../value-objects/card-field-name';
import type { CardTemplate } from '../value-objects/card-template.vo';
import type { CardField } from './note-card.aggregate.type';

// What the AI wrote for each field it was asked: null when the texts do not give it (R21).
export type CardFieldValues = Readonly<Record<string, string | null>>;

export const emptyFieldsOf = (
    template: CardTemplate,
): ReadonlyArray<CardField> =>
    template.fieldNames.map((name) => ({ name, value: null, isManual: false }));

// R25: the fields of the template, in its order and spelling, keeping the value of a field of the same name.
export const fieldsAdopting = (
    fields: ReadonlyArray<CardField>,
    template: CardTemplate,
): ReadonlyArray<CardField> =>
    template.fieldNames.map((name) => {
        const kept = fields.find((field) => sameFieldName(field.name, name));
        return kept === undefined
            ? { name, value: null, isManual: false }
            : { ...kept, name };
    });

// R22: a template brings a field the card did not have.
export const addsFields = (
    fields: ReadonlyArray<CardField>,
    template: CardTemplate,
): boolean =>
    template.fieldNames.some(
        (name) => !fields.some((field) => sameFieldName(field.name, name)),
    );

// R21, R22: the values found, never over a field corrected by hand; a field the AI left out is « non trouvé ».
export const fieldsFilledWith = (
    fields: ReadonlyArray<CardField>,
    values: CardFieldValues,
): ReadonlyArray<CardField> =>
    fields.map((field) =>
        field.isManual
            ? field
            : { ...field, value: values[field.name] ?? null },
    );

const invalidField = (): NoteException =>
    new NoteException({
        code: NoteExceptionCodeEnum.NOTE_CARD_FIELD_INVALID,
        message: 'Invalid card field',
        context: { min: 1, max: CARD_FIELD_VALUE_MAX_LENGTH },
    });

// R22: a field of the card, written by hand, trimmed, 1 to CARD_FIELD_VALUE_MAX_LENGTH signs.
export const fieldsCorrecting = (
    fields: ReadonlyArray<CardField>,
    name: string,
    raw: string,
): ReadonlyArray<CardField> => {
    const value = raw.trim();
    if (value.length === 0 || value.length > CARD_FIELD_VALUE_MAX_LENGTH)
        throw invalidField();
    if (!fields.some((field) => sameFieldName(field.name, name)))
        throw invalidField();
    return fields.map((field) =>
        sameFieldName(field.name, name)
            ? { name: field.name, value, isManual: true }
            : field,
    );
};
