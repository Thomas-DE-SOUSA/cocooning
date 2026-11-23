import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
    type SessionClaims,
    SessionTokenSigner,
} from '@cocooning/couple-server-business-logic/authentication';
import { SESSION_TOKEN_ALGORITHM } from '../../session-token-algorithm';
import { SessionTokenPayloadSchema } from './session-token-payload';

const MILLISECONDS_PER_SECOND = 1_000;

const toSeconds = (instant: Date): number =>
    Math.floor(instant.getTime() / MILLISECONDS_PER_SECOND);

// jsonwebtoken reads Date.now() unless given the instant: noTimestamp at signing, clockTimestamp at verification.
@Injectable()
export class JwtSessionTokenSigner extends SessionTokenSigner {
    constructor(private readonly jwtService: JwtService) {
        super();
    }

    override sign(claims: SessionClaims): Promise<string> {
        return this.jwtService.signAsync(
            {
                sub: claims.userId,
                ver: claims.sessionVersion,
                exp: toSeconds(claims.expiresAt),
            },
            { algorithm: SESSION_TOKEN_ALGORITHM, noTimestamp: true },
        );
    }

    override async verify(
        token: string,
        now: Date,
    ): Promise<SessionClaims | null> {
        const payload = await this.decode(token, now);
        const parsed = SessionTokenPayloadSchema.safeParse(payload);
        if (!parsed.success) return null;
        return {
            userId: parsed.data.sub,
            sessionVersion: parsed.data.ver,
            expiresAt: new Date(parsed.data.exp * MILLISECONDS_PER_SECOND),
        };
    }

    // A forged, malformed or expired token is an expected answer of the port, not a failure (null).
    private async decode(token: string, now: Date): Promise<object | null> {
        try {
            return await this.jwtService.verifyAsync<object>(token, {
                algorithms: [SESSION_TOKEN_ALGORITHM],
                clockTimestamp: toSeconds(now),
            });
        } catch {
            return null;
        }
    }
}
