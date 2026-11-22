export const AuthenticationExceptionCodeEnum = {
    AUTHENTICATION_SESSION_MISSING: 'AUTHENTICATION_SESSION_MISSING',
    AUTHENTICATION_SESSION_INVALID: 'AUTHENTICATION_SESSION_INVALID',
} as const;

export type AuthenticationExceptionCode =
    (typeof AuthenticationExceptionCodeEnum)[keyof typeof AuthenticationExceptionCodeEnum];
