import { z } from 'zod';
import { CardTemplateSchema } from './card-template.zod';
import { FolderSubjectSchema } from './folder-subject.zod';

// R17, R18, R22: the subject and the card template of a smart folder, edited from any folder of its tree.
export const EditFolderTemplateRequestSchema = z.object({
    subject: FolderSubjectSchema,
    cardTemplate: CardTemplateSchema,
});

export type EditFolderTemplateRequest = z.infer<
    typeof EditFolderTemplateRequestSchema
>;
