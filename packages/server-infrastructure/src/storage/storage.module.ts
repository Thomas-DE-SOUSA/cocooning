import {
    type DynamicModule,
    type FactoryProvider,
    Global,
    Module,
} from '@nestjs/common';
import { FileStorage } from '@cocooning/shared-kernel/ports';
import { LocalDiskFileStorage } from './local-disk-file-storage';

export type StorageOptions = {
    readonly rootDirectory: string;
};

export type StorageModuleAsyncOptions = Pick<
    FactoryProvider<StorageOptions>,
    'inject' | 'useFactory'
>;

const STORAGE_OPTIONS = Symbol('STORAGE_OPTIONS');

// Decision 0027: files on the disk of the VM, under a root directory the API reads from its configuration.
@Global()
@Module({})
export class StorageModule {
    static forRootAsync(options: StorageModuleAsyncOptions): DynamicModule {
        return {
            module: StorageModule,
            providers: [
                { provide: STORAGE_OPTIONS, ...options },
                {
                    provide: FileStorage,
                    inject: [STORAGE_OPTIONS],
                    useFactory: ({ rootDirectory }: StorageOptions) =>
                        new LocalDiskFileStorage(rootDirectory),
                },
            ],
            exports: [FileStorage],
        };
    }
}
