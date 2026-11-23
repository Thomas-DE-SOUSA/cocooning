import 'server-only';
import { SESSION_COOKIE_NAME } from '@cocooning/couple-contract/authentication';
import { cookies } from 'next/headers';

// Passed unresolved to the module factories: read on each request, at the moment a use case calls the API (decision 0036).
export async function getSessionToken(): Promise<string | null> {
    return (await cookies()).get(SESSION_COOKIE_NAME)?.value ?? null;
}
