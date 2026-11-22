import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { BaseException } from '@cocooning/shared-kernel/exceptions';
import {
    type CoupleSharedKernelExceptionCode,
    CoupleSharedKernelExceptionCodeEnum,
} from './couple-shared-kernel-exception-code.enum';

export type ExecutionContextField = keyof ExecutionContext;

export class MissingExecutionContextException extends BaseException<CoupleSharedKernelExceptionCode> {
    readonly missing: readonly ExecutionContextField[];

    constructor(missing: readonly ExecutionContextField[]) {
        const fields = missing.join(', ');
        super({
            code: CoupleSharedKernelExceptionCodeEnum.EXECUTION_CONTEXT_MISSING,
            message: `Missing execution context: ${fields}`,
            context: { missing: fields },
        });
        this.missing = Object.freeze([...missing]);
    }
}
