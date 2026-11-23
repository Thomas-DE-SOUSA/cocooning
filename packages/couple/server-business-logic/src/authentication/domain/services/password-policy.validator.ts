import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import {
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
} from '@cocooning/couple-shared-kernel/limits';
import { AuthenticationException } from '../exceptions/authentication.exception';

export class PasswordPolicyValidator {
    // R2: 12 to 128 characters, checked when the account is created.
    static ensureAcceptable(password: string): void {
        const length = password.length;
        if (length >= PASSWORD_MIN_LENGTH && length <= PASSWORD_MAX_LENGTH) {
            return;
        }
        throw new AuthenticationException({
            code: AuthenticationExceptionCodeEnum.AUTHENTICATION_PASSWORD_TOO_WEAK,
            message: 'Password does not meet the policy',
        });
    }
}
