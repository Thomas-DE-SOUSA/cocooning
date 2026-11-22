import { BaseException } from '@cocooning/shared-kernel/exceptions';
import type { FileStorageExceptionCode } from './file-storage-exception-code.enum';

export class FileStorageException extends BaseException<FileStorageExceptionCode> {}
