import {
    CARD_FIELD_NAME_MAX_LENGTH,
    CARD_TEMPLATE_MAX_FIELDS,
} from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';

// R17: a field name, trimmed, 1 to CARD_FIELD_NAME_MAX_LENGTH signs.
export const CardFieldNameSchema = z
    .string()
    .trim()
    .min(1)
    .max(CARD_FIELD_NAME_MAX_LENGTH);

const isUniqueIgnoringCase = (names: ReadonlyArray<string>): boolean =>
    new Set(names.map((name) => name.toLocaleLowerCase('fr'))).size ===
    names.length;

// R17: 1 to CARD_TEMPLATE_MAX_FIELDS fields, never twice the same name; the domain checks it again.
export const CardTemplateSchema = z
    .array(CardFieldNameSchema)
    .min(1)
    .max(CARD_TEMPLATE_MAX_FIELDS)
    .refine(isUniqueIgnoringCase, { message: 'Field names must be unique' });
