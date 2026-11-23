import { JwtService } from '@nestjs/jwt';
import { SESSION_TOKEN_ALGORITHM } from '../../../src/modules/authentication';
import { TEST_AUTH_JWT_SECRET } from '../env/test-secrets';

export type SessionTokenClaims = Readonly<Record<string, string | number>>;

// Signed like JwtSessionTokenSigner at sign-in (decision 0034), so a spec can forge the claims it needs.
export function signSessionToken(
    claims: SessionTokenClaims,
    secret: string = TEST_AUTH_JWT_SECRET,
): string {
    return new JwtService({ secret }).sign(
        { ...claims },
        { algorithm: SESSION_TOKEN_ALGORITHM },
    );
}

const SECONDS_PER_HOUR = 3_600;
const FIRST_SESSION_VERSION = 1;
const MILLISECONDS_PER_SECOND = 1_000;

// A session valid for an hour from the given instant, the clock the API reads, at the first session version of the account.
export function partnerSessionToken(userId: string, now: Date): string {
    const nowSeconds = Math.floor(now.getTime() / MILLISECONDS_PER_SECOND);
    return signSessionToken({
        sub: userId,
        ver: FIRST_SESSION_VERSION,
        exp: nowSeconds + SECONDS_PER_HOUR,
    });
}
