import { z } from 'zod';

export const messagingEnvSchema = z.object({
    PHOTO_PROMPT_SCHEDULER_ENABLED: z.stringbool(),
});

export type MessagingEnv = z.infer<typeof messagingEnvSchema>;
