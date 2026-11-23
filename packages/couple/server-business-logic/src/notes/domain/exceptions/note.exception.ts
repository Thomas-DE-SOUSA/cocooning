import type { NoteExceptionCode } from '@cocooning/couple-contract/notes';
import { BaseException } from '@cocooning/shared-kernel/exceptions';

export class NoteException extends BaseException<NoteExceptionCode> {}
