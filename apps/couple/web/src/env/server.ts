import 'server-only';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const serverEnv = createEnv({
    server: {
        NODE_ENV: z.enum(['development', 'production', 'test']),
        API_URL: z.url(),
        API_TIMEOUT_MS: z.coerce.number().int().positive(),
    },
    experimental__runtimeEnv: {},
    emptyStringAsUndefined: true,
    // Next logs an instrumentation error and keeps serving 500s: exiting makes a missing variable stop the server (core.md rule 11).
    onValidationError: (issues) => {
        console.error('Invalid environment variables', issues);
        process.exit(1);
    },
});
