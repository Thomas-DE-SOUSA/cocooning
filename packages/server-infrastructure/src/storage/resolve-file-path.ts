import { isAbsolute, join, normalize, sep } from 'node:path';
import { FileStorageExceptionCodeEnum } from './file-storage-exception-code.enum';
import { FileStorageException } from './file-storage.exception';

const VALID_KEY = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;
const PARENT_SEGMENT = '..';

const isSafeKey = (key: string): boolean =>
    VALID_KEY.test(key) &&
    !isAbsolute(key) &&
    !normalize(key).split(sep).includes(PARENT_SEGMENT);

// A key comes from business code; it must never reach outside the storage root.
export function resolveFilePath(rootDirectory: string, key: string): string {
    if (!isSafeKey(key)) {
        throw new FileStorageException({
            code: FileStorageExceptionCodeEnum.FILE_STORAGE_KEY_INVALID,
            message: 'Invalid file storage key',
        });
    }
    return join(rootDirectory, key);
}
