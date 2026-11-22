import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FileStorageExceptionCodeEnum } from './file-storage-exception-code.enum';
import { LocalDiskFileStorage } from './local-disk-file-storage';

const PHOTO = {
    key: 'couple-1/photos/photo-1.jpg',
    content: new Uint8Array([1, 2, 3]),
    contentType: 'image/jpeg',
};

describe('Feature: store files on the local disk', () => {
    let rootDirectory: string;
    let storage: LocalDiskFileStorage;

    beforeEach(async () => {
        rootDirectory = await mkdtemp(join(tmpdir(), 'cocooning-storage-'));
        storage = new LocalDiskFileStorage(rootDirectory);
    });
    afterEach(async () => {
        await rm(rootDirectory, { recursive: true, force: true });
    });

    describe('Scenario: a stored file', () => {
        it('reads back with its content type', async () => {
            await storage.store(PHOTO);
            await expect(storage.read(PHOTO.key)).resolves.toEqual(PHOTO);
        });

        it('is gone after deletion', async () => {
            await storage.store(PHOTO);
            await storage.delete(PHOTO.key);
            await expect(storage.read(PHOTO.key)).resolves.toBeNull();
        });
    });

    describe('Scenario: an unknown key', () => {
        it('reads as null and deletes without error', async () => {
            await expect(
                storage.read('couple-1/missing.jpg'),
            ).resolves.toBeNull();
            await expect(
                storage.delete('couple-1/missing.jpg'),
            ).resolves.toBeUndefined();
        });
    });

    describe('Scenario: a key that tries to leave the storage root', () => {
        it.each([
            '../outside.jpg',
            'couple-1/../../outside.jpg',
            '/etc/passwd',
            '',
        ])('refuses %p', async (key) => {
            await expect(storage.store({ ...PHOTO, key })).rejects.toEqual(
                expect.objectContaining({
                    code: FileStorageExceptionCodeEnum.FILE_STORAGE_KEY_INVALID,
                }),
            );
        });
    });
});
