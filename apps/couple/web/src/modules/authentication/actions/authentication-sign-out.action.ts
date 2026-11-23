'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { SESSION_COOKIE_NAME } from '@cocooning/couple-contract/authentication';
import type { Result } from '@cocooning/shared-kernel/utils';
import { cookies } from 'next/headers';
import { authenticationModule } from '../services/authentication-module.factory';

// Decision 0034: the API closes the sessions of every device, then this browser drops its cookie.
export async function authenticationSignOutAction(): Promise<
    Result<null, ApiError>
> {
    const closed = await authenticationModule().signOut.execute();
    if (closed.success) (await cookies()).delete(SESSION_COOKIE_NAME);
    return closed;
}
