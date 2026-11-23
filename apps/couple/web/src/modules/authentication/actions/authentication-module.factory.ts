import 'server-only';
import { createAuthenticationModule } from '@cocooning/couple-client-infrastructure/shared';
import { serverEnv } from '@/env/server';

export const authenticationModule = createAuthenticationModule(
    serverEnv.API_URL,
    serverEnv.API_TIMEOUT_MS,
);
