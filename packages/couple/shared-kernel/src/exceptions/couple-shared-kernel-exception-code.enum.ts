export const CoupleSharedKernelExceptionCodeEnum = {
    EXECUTION_CONTEXT_MISSING: 'EXECUTION_CONTEXT_MISSING',
} as const;

export type CoupleSharedKernelExceptionCode =
    (typeof CoupleSharedKernelExceptionCodeEnum)[keyof typeof CoupleSharedKernelExceptionCodeEnum];
