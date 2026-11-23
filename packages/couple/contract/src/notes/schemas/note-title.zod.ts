import { NOTE_TITLE_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';

// R8: trimmed, never empty, at most NOTE_TITLE_MAX_LENGTH signs; the domain checks it again.
export const NoteTitleSchema = z
    .string()
    .trim()
    .min(1)
    .max(NOTE_TITLE_MAX_LENGTH);
