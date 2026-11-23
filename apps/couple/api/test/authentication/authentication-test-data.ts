import {
    AuthenticationExceptionCodeEnum,
    type SignInResponse,
    SignInResponseSchema,
} from '@cocooning/couple-contract/authentication';
import type { TestResponse } from '../shared/app/test-client';

export const NOW = new Date('2026-11-23T08:00:00.000Z');
export const NOW_SECONDS = NOW.getTime() / 1_000;
export const MILLISECONDS_PER_DAY = 86_400_000;
export const SESSION_LIFETIME_IN_DAYS = 90;
export const PARTNER_A = '01936b2e-7c4a-7000-8000-0000000000a1';
export const PARTNER_B = '01936b2e-7c4a-7000-8000-0000000000b1';
export const UNKNOWN_PARTNER = '01936b2e-7c4a-7000-8000-0000000000f1';
export const EMAIL_ADDRESS_A = 'thomas@cocooning.test';
export const EMAIL_ADDRESS_B = 'partner@cocooning.test';
export const PASSWORD = 'correct horse battery staple';

const refusal = (status: number, code: string, message: string) => ({
    status,
    body: { status, code, message, context: null },
});

export const SESSION_MISSING = refusal(
    401,
    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING,
    'Session missing',
);
export const SESSION_INVALID = refusal(
    401,
    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_INVALID,
    'Session invalid',
);
export const CREDENTIALS_INVALID = refusal(
    401,
    AuthenticationExceptionCodeEnum.AUTHENTICATION_CREDENTIALS_INVALID,
    'Invalid credentials',
);

export const sessionOf = (response: TestResponse): SignInResponse =>
    SignInResponseSchema.parse(response.body);

export const isoAfterDays = (days: number): string =>
    new Date(NOW.getTime() + days * MILLISECONDS_PER_DAY).toISOString();
