import { z } from 'zod';

// Read by the Next server only, which sets the HttpOnly cookie: the token never reaches client code (decision 0034).
export const SignInResponseSchema = z.object({
    userId: z.string(),
    sessionToken: z.string(),
    sessionExpiresAt: z.string(),
});

export type SignInResponse = z.infer<typeof SignInResponseSchema>;
