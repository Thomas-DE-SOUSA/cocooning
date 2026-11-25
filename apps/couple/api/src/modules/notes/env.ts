import { z } from 'zod';

// Decision 0054: the AI of the smart folders. An empty key starts the API without it: proposals and cards fail.
export const notesEnvSchema = z.object({
    NOTE_CARD_GEMINI_API_KEY: z.string().trim(),
    NOTE_CARD_GEMINI_MODEL: z.string().trim().min(1),
});

export type NotesEnv = z.infer<typeof notesEnvSchema>;
