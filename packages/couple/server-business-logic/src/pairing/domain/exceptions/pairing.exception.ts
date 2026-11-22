import type { PairingExceptionCode } from '@cocooning/couple-contract/pairing';
import { BaseException } from '@cocooning/shared-kernel/exceptions';

export class PairingException extends BaseException<PairingExceptionCode> {}
