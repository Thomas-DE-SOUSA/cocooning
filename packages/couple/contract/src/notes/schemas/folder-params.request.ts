import { z } from 'zod';

export const FolderParamsRequestSchema = z.object({ folderId: z.uuid() });

export type FolderParamsRequest = z.infer<typeof FolderParamsRequestSchema>;
