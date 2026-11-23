import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { violatedUniqueConstraint } from '@cocooning/couple-prisma/errors';
import { AuthenticationException } from '@cocooning/couple-server-business-logic/authentication';

// Index of the authentication_account migration (docs/couple/architecture/authentication/tables.md), worded as the domain does.
const EMAIL_ADDRESS_KEY = 'account_email_address_key';

export function toAccountConflict(
    error: unknown,
): AuthenticationException | null {
    if (violatedUniqueConstraint(error) !== EMAIL_ADDRESS_KEY) return null;
    return new AuthenticationException({
        code: AuthenticationExceptionCodeEnum.AUTHENTICATION_ACCOUNT_ALREADY_EXISTS,
        message: 'Account already exists',
    });
}
