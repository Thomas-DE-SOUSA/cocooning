import type { SessionClaims } from '../../../domain/models/account.aggregate.type';
import { SessionTokenSigner } from '../../../domain/ports/session-token-signer';

// Mimics the JWT adapter: a token it never signed, or past its expiry, is worth nothing.
export class FakeSessionTokenSigner extends SessionTokenSigner {
    private issued: ReadonlyMap<string, SessionClaims> = new Map();

    override sign(claims: SessionClaims): Promise<string> {
        const token = `session-token-${this.issued.size + 1}`;
        this.issued = new Map([...this.issued, [token, claims]]);
        return Promise.resolve(token);
    }

    override verify(token: string, now: Date): Promise<SessionClaims | null> {
        const claims = this.issued.get(token) ?? null;
        const isLive = claims !== null && now < claims.expiresAt;
        return Promise.resolve(isLive ? claims : null);
    }
}
