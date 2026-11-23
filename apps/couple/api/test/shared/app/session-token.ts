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
