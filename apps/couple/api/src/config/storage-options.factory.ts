import { ConfigService } from '@nestjs/config';
import type { StorageModuleAsyncOptions } from '@cocooning/server-infrastructure/storage';
import type { Environment } from '../env';

export const storageOptionsFactory: StorageModuleAsyncOptions = {
    inject: [ConfigService],
    useFactory: (config: ConfigService<Environment, true>) => ({
        rootDirectory: config.getOrThrow('FILE_STORAGE_DIRECTORY', {
            infer: true,
        }),
    }),
};
