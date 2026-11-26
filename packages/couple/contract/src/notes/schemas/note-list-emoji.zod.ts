import { NOTE_LIST_EMOJI_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';

// R26: trimmed, never empty, at most NOTE_LIST_EMOJI_MAX_LENGTH code points, null without one; the domain checks it again.
export const NoteListEmojiSchema = z
    .string()
    .trim()
    .min(1)
    .max(NOTE_LIST_EMOJI_MAX_LENGTH)
    .nullable();
