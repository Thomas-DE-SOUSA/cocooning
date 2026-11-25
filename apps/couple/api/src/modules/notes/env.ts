import { z } from 'zod';

// Decision 0054: the AI of the smart folders. An empty key starts the API without it: proposals and cards fail.
export const notesEnvSchema = z.object({
    // Our SearXNG (decision 0054), joined on the internal network of the VM; locally the container of local-setup.md.
    WEB_SEARCH_SEARXNG_URL: z.url({ protocol: /^https?$/ }),
    // The bound in time of one search and of each page read.
    WEB_SEARCH_TIMEOUT_MS: z.coerce.number().int().positive(),
    // OpenStreetMap through Nominatim (decision 0055): its address, the bound in time of one request, and the
    // User-Agent its usage policy asks for, with a contact.
    PLACE_DIRECTORY_NOMINATIM_URL: z.url({ protocol: /^https?$/ }),
    PLACE_DIRECTORY_TIMEOUT_MS: z.coerce.number().int().positive(),
    PLACE_DIRECTORY_USER_AGENT: z.string().trim().min(1),
    NOTE_CARD_GEMINI_API_KEY: z.string().trim(),
    NOTE_CARD_GEMINI_MODEL: z.string().trim().min(1),
    // R23: the searches a couple makes per day of Paris, all folders together.
    NOTE_CARD_DAILY_SEARCH_LIMIT: z.coerce.number().int().positive(),
    // The background task that fills the cards (decision 0054): off in the E2E tests, which call tick() themselves.
    NOTE_CARD_ENRICHMENT_ENABLED: z.stringbool(),
    NOTE_CARD_ENRICHMENT_INTERVAL_MS: z.coerce.number().int().positive(),
});

export type NotesEnv = z.infer<typeof notesEnvSchema>;
