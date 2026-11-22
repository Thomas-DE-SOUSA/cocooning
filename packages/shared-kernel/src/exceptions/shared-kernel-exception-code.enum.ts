export const SharedKernelExceptionCodeEnum = {
    UUID_GENERATOR_NOT_CONFIGURED: 'UUID_GENERATOR_NOT_CONFIGURED',
    UUID_GENERATOR_ALREADY_CONFIGURED: 'UUID_GENERATOR_ALREADY_CONFIGURED',
    UUID_INVALID: 'UUID_INVALID',
    ENUM_VALUE_INVALID: 'ENUM_VALUE_INVALID',
    METADATA_DATA_CORRUPTED: 'METADATA_DATA_CORRUPTED',
} as const;

export type SharedKernelExceptionCode =
    (typeof SharedKernelExceptionCodeEnum)[keyof typeof SharedKernelExceptionCodeEnum];
