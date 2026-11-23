import { serverEnv } from '@/env/server';

// Reading the environment at server start stops `next start` on a missing variable, instead of the first sign-in.
export function register(): void {
    void serverEnv.API_URL;
}
