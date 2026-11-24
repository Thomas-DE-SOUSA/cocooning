import type { MessagingExceptionCode } from '@cocooning/couple-contract/messaging';
import { BaseException } from '@cocooning/shared-kernel/exceptions';

export class MessagingException extends BaseException<MessagingExceptionCode> {}
