import { z } from 'zod';

// R17: what the AI proposes, corrected by the partner before the folder is created.
export const FolderTemplateProposalResponseSchema = z.object({
    subject: z.string(),
    cardTemplate: z.array(z.string()),
});

export type FolderTemplateProposalResponse = z.infer<
    typeof FolderTemplateProposalResponseSchema
>;
