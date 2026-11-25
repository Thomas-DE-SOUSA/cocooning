import { FOLDER_NAME_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';

// R13: trimmed, never empty, at most FOLDER_NAME_MAX_LENGTH signs; the domain checks it again.
export const FolderNameSchema = z
    .string()
    .trim()
    .min(1)
    .max(FOLDER_NAME_MAX_LENGTH);
