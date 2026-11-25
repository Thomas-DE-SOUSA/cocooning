import { FOLDER_SUBJECT_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';

// R17: one sentence, trimmed, at most FOLDER_SUBJECT_MAX_LENGTH signs; the domain checks it again.
export const FolderSubjectSchema = z
    .string()
    .trim()
    .min(1)
    .max(FOLDER_SUBJECT_MAX_LENGTH);
