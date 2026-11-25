import {
    CARD_FIELD_NAME_MAX_LENGTH,
    CARD_TEMPLATE_MAX_FIELDS,
    FOLDER_SUBJECT_MAX_LENGTH,
} from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';
import type { Translator } from '../../../shared/translator';
import { createFolderNameFormSchema } from './folder-name-form.zod';

const isUniqueIgnoringCase = (fields: ReadonlyArray<string>): boolean =>
    new Set(fields.map((field) => field.toLocaleLowerCase('fr'))).size ===
    fields.length;

// R17, as the API checks it: a trimmed subject, and 1 to CARD_TEMPLATE_MAX_FIELDS trimmed fields, never twice the same.
export const createFolderTemplateFormSchema = (t: Translator) =>
    z.object({
        subject: z
            .string()
            .trim()
            .min(1, t('form.subject.errors.required'))
            .max(FOLDER_SUBJECT_MAX_LENGTH, t('form.subject.errors.tooLong')),
        fields: z
            .array(
                z
                    .string()
                    .trim()
                    .min(1, t('form.fields.errors.required'))
                    .max(
                        CARD_FIELD_NAME_MAX_LENGTH,
                        t('form.fields.errors.tooLong'),
                    ),
            )
            .min(1, t('form.fields.errors.required'))
            .max(CARD_TEMPLATE_MAX_FIELDS, t('form.fields.errors.tooMany'))
            .refine(isUniqueIgnoringCase, t('form.fields.errors.duplicate')),
    });

export type FolderTemplateForm = z.infer<
    ReturnType<typeof createFolderTemplateFormSchema>
>;

// R13, R17: the name of a new smart folder, with the subject and the fields corrected from the proposal.
export const createSmartFolderFormSchema = (t: Translator) =>
    createFolderNameFormSchema(t).extend(
        createFolderTemplateFormSchema(t).shape,
    );

export type SmartFolderForm = z.infer<
    ReturnType<typeof createSmartFolderFormSchema>
>;
