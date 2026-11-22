import type { AuthenticationExceptionCode } from '@cocooning/couple-contract/authentication';
import { BaseException } from '@cocooning/shared-kernel/exceptions';

export class AuthenticationException extends BaseException<AuthenticationExceptionCode> {}
