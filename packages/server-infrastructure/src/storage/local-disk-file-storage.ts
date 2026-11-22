import { FileStorage, type StoredFile } from '@cocooning/shared-kernel/ports';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { FileStorageExceptionCodeEnum } from './file-storage-exception-code.enum';
import { FileStorageException } from './file-storage.exception';
import { resolveFilePath } from './resolve-file-path';

const METADATA_SUFFIX = '.meta.json';
const NOT_FOUND = 'ENOENT';

type FileMetadata = { readonly contentType: string };

// Not `instanceof Error`: Node system errors can come from another realm (Jest runs specs in a VM context).
const isNotFound = (error: unknown): boolean =>
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === NOT_FOUND;

const parseMetadata = (raw: string): FileMetadata => {
    const parsed: unknown = JSON.parse(raw);
    if (
        typeof parsed !== 'object' ||
        parsed === null ||
        !('contentType' in parsed) ||
        typeof parsed.contentType !== 'string'
    ) {
        throw new FileStorageException({
            code: FileStorageExceptionCodeEnum.FILE_STORAGE_DATA_CORRUPTED,
            message: 'Missing content type in file metadata',
        });
    }
    return { contentType: parsed.contentType };
};

export class LocalDiskFileStorage extends FileStorage {
    constructor(private readonly rootDirectory: string) {
        super();
    }

    override async store(file: StoredFile): Promise<void> {
        const path = resolveFilePath(this.rootDirectory, file.key);
        const metadata: FileMetadata = { contentType: file.contentType };
        await mkdir(dirname(path), { recursive: true });
        await writeFile(path, file.content);
        await writeFile(`${path}${METADATA_SUFFIX}`, JSON.stringify(metadata));
    }

    override async read(key: string): Promise<StoredFile | null> {
        const path = resolveFilePath(this.rootDirectory, key);
        try {
            const [content, rawMetadata] = await Promise.all([
                readFile(path),
                readFile(`${path}${METADATA_SUFFIX}`, 'utf8'),
            ]);
            return {
                key,
                content: new Uint8Array(content),
                contentType: parseMetadata(rawMetadata).contentType,
            };
        } catch (error) {
            if (isNotFound(error)) return null;
            throw error;
        }
    }

    override async delete(key: string): Promise<void> {
        const path = resolveFilePath(this.rootDirectory, key);
        await Promise.all([
            rm(path, { force: true }),
            rm(`${path}${METADATA_SUFFIX}`, { force: true }),
        ]);
    }
}
