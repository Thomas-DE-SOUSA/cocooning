import { BaseException } from './base-exception';
import type { SharedKernelExceptionCode } from './shared-kernel-exception-code.enum';

export class SharedKernelException extends BaseException<SharedKernelExceptionCode> {}
