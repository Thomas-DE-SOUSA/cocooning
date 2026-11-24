import { Test } from '@nestjs/testing';
import { FileStorage } from '@cocooning/shared-kernel/ports';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { StorageModule } from './storage.module';

describe('Feature: provide the FileStorage port', () => {
    let rootDirectory: string;

    beforeEach(async () => {
        rootDirectory = await mkdtemp(join(tmpdir(), 'cocooning-storage-'));
    });
    afterEach(async () => {
        await rm(rootDirectory, { recursive: true, force: true });
    });

    describe('Scenario: the API gives the root directory', () => {
        it('stores files under that directory', async () => {
            const moduleRef = await Test.createTestingModule({
                imports: [
                    StorageModule.forRootAsync({
                        useFactory: () => ({ rootDirectory }),
                    }),
                ],
            }).compile();
            await moduleRef.get(FileStorage).store({
                key: 'couple-1/photo.jpg',
                content: new Uint8Array([1, 2, 3]),
                contentType: 'image/jpeg',
            });
            await expect(
                readFile(join(rootDirectory, 'couple-1/photo.jpg')),
            ).resolves.toEqual(Buffer.from([1, 2, 3]));
        });
    });
});
