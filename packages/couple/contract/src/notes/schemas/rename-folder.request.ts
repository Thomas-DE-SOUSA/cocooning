import { z } from 'zod';
import { FolderNameSchema } from './folder-name.zod';

export const RenameFolderRequestSchema = z.object({ name: FolderNameSchema });

export type RenameFolderRequest = z.infer<typeof RenameFolderRequestSchema>;
