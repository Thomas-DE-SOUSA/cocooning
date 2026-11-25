import {
    createFolderNameFormSchema,
    type SmartFolderForm,
} from '@cocooning/couple-client-business-logic/notes';
import type { Translator } from '@cocooning/couple-client-business-logic/shared';
import { z } from 'zod';

// R13: the « Nouveau dossier » sheet holds the fields of a smart folder too; a classic folder is checked on its name
// alone, the subject and the fields kept as typed for a switch back to « IA ».
export const createClassicFolderFormSchema = (t: Translator) =>
    createFolderNameFormSchema(t).extend({
        subject: z.string(),
        fields: z.array(z.string()),
    }) satisfies z.ZodType<SmartFolderForm>;
