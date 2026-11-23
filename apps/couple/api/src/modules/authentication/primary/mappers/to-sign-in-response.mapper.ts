import type { SignInResponse } from '@cocooning/couple-contract/authentication';
import type { SessionView } from '@cocooning/couple-server-business-logic/authentication';

// Dates cross the wire as ISO strings (contracts.md rule 4).
export const toSignInResponse = (view: SessionView): SignInResponse => ({
    userId: view.userId,
    sessionToken: view.sessionToken,
    sessionExpiresAt: view.sessionExpiresAt.toISOString(),
});
