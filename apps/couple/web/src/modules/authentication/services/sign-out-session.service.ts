import 'server-only';
import type { SignOutUseCase } from '@cocooning/couple-client-business-logic/authentication';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { SESSION_COOKIE_NAME } from '@cocooning/couple-contract/authentication';
import type { Result } from '@cocooning/shared-kernel/utils';

export type SessionCookieJar = {
    delete(name: string): void;
};

// Decision 0034: the API closes the sessions of every device, then this browser drops its cookie; a failure keeps it.
export async function closeSignOutSession(
    signOut: SignOutUseCase,
    cookieJar: () => Promise<SessionCookieJar>,
): Promise<Result<null, ApiError>> {
    const closed = await signOut.execute();
    if (closed.success) (await cookieJar()).delete(SESSION_COOKIE_NAME);
    return closed;
}
