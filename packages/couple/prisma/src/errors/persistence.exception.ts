import { BaseException } from '@cocooning/shared-kernel/exceptions';
import type { PersistenceExceptionCode } from './persistence-exception-code.enum';

export class PersistenceException extends BaseException<PersistenceExceptionCode> {}
