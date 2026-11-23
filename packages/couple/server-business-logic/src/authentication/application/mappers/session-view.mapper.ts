import type { SessionClaims } from '../../domain/models/account.aggregate.type';

export type SessionView = {
    readonly userId: string;
    readonly sessionToken: string;
    readonly sessionExpiresAt: Date;
};

export const toSessionView = (
    claims: SessionClaims,
    sessionToken: string,
): SessionView => ({
    userId: claims.userId,
    sessionToken,
    sessionExpiresAt: claims.expiresAt,
});
