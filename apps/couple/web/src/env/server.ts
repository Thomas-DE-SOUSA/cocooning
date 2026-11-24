import 'server-only';
import { createEnv } from '@t3-oss/env-nextjs';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { z } from 'zod';

export const serverEnv = createEnv({
    server: {
        NODE_ENV: z.enum(['development', 'production', 'test']),
        API_URL: z.url(),
        API_TIMEOUT_MS: z.coerce.number().int().positive(),
        NOTES_COLLABORATION_URL: z.url({ protocol: /^wss?$/ }),
    },
    experimental__runtimeEnv: {},
    emptyStringAsUndefined: true,
    // `next build` loads the pages that read the API, and the image is built without its runtime variables: instrumentation.ts checks them at start.
    skipValidation: process.env['NEXT_PHASE'] === PHASE_PRODUCTION_BUILD,
    // Next logs an instrumentation error and keeps serving 500s: exiting makes a missing variable stop the server (core.md rule 11).
    onValidationError: (issues) => {
        console.error('Invalid environment variables', issues);
        process.exit(1);
    },
});
