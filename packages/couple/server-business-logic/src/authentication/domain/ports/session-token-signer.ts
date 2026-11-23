import type { SessionClaims } from '../models/account.aggregate.type';

export abstract class SessionTokenSigner {
    abstract sign(claims: SessionClaims): Promise<string>;
    // Null for a forged, malformed or expired token.
    abstract verify(token: string, now: Date): Promise<SessionClaims | null>;
}
