import { JwtService } from '@nestjs/jwt';
import { SESSION_TOKEN_ALGORITHM } from '../../../src/modules/authentication';
import { TEST_AUTH_JWT_SECRET } from '../env/test-secrets';

export type SessionTokenClaims = Readonly<Record<string, string | number>>;

// Signed like the authentication context will sign at sign-in (decision 0030): no endpoint signs in phase 2.
export function signSessionToken(
    claims: SessionTokenClaims,
    secret: string = TEST_AUTH_JWT_SECRET,
): string {
    return new JwtService({ secret }).sign(
        { ...claims },
        { algorithm: SESSION_TOKEN_ALGORITHM },
    );
}
