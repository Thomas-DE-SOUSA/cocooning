import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { EMAIL_ADDRESS_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { ValueObject } from '@cocooning/shared-kernel/domain';
import { AuthenticationException } from '../exceptions/authentication.exception';

const EMAIL_ADDRESS_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type EmailAddressProps = {
    readonly value: string;
};

export class EmailAddress extends ValueObject<EmailAddressProps> {
    private constructor(props: EmailAddressProps) {
        super(props);
        Object.freeze(this);
    }

    // R1: an account is created with a well-formed address, stored trimmed and lower-cased.
    static create(rawEmailAddress: string): EmailAddress {
        const value = EmailAddress.normalize(rawEmailAddress);
        const isTooLong = value.length > EMAIL_ADDRESS_MAX_LENGTH;
        if (isTooLong || !EMAIL_ADDRESS_PATTERN.test(value)) {
            throw new AuthenticationException({
                code: AuthenticationExceptionCodeEnum.AUTHENTICATION_EMAIL_ADDRESS_INVALID,
                message: 'Invalid email address',
            });
        }
        return new EmailAddress({ value });
    }

    static from(value: string): EmailAddress {
        return new EmailAddress({ value });
    }

    // R3: at sign-in, a malformed address simply matches no account.
    static normalize(rawEmailAddress: string): string {
        return rawEmailAddress.trim().toLowerCase();
    }

    get value(): string {
        return this.props.value;
    }
}
