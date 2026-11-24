import type { AgendaExceptionCode } from '@cocooning/couple-contract/agenda';
import { BaseException } from '@cocooning/shared-kernel/exceptions';

export class AgendaException extends BaseException<AgendaExceptionCode> {}
