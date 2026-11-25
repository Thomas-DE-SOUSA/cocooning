import { z } from 'zod';

// Decision 0054: the AI of the smart folders. An empty key starts the API without it: proposals and cards fail.
export const notesEnvSchema = z.object({
    // Our SearXNG (decision 0054), joined on the internal network of the VM; locally the container of local-setup.md.
    WEB_SEARCH_SEARXNG_URL: z.url({ protocol: /^https?$/ }),
    // The bound in time of one search and of each page read.
    WEB_SEARCH_TIMEOUT_MS: z.coerce.number().int().positive(),
    NOTE_CARD_GEMINI_API_KEY: z.string().trim(),
    NOTE_CARD_GEMINI_MODEL: z.string().trim().min(1),
});

export type NotesEnv = z.infer<typeof notesEnvSchema>;
