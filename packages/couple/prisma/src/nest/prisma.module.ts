import {
    type DynamicModule,
    type FactoryProvider,
    Global,
    Module,
} from '@nestjs/common';
import { UnitOfWork } from '@cocooning/shared-kernel/ports';
import { PrismaService, type TransactionOptions } from './prisma.service';
import { PrismaUnitOfWork } from './prisma-unit-of-work';

const PRISMA_MODULE_OPTIONS = Symbol('PRISMA_MODULE_OPTIONS');

export type PrismaModuleOptions = {
    readonly connectionString: string;
    readonly transaction: TransactionOptions;
};

export type PrismaModuleAsyncOptions = Pick<
    FactoryProvider<PrismaModuleOptions>,
    'inject' | 'useFactory'
>;

@Global()
@Module({})
export class PrismaModule {
    static forRoot(options: PrismaModuleOptions): DynamicModule {
        return PrismaModule.forRootAsync({ useFactory: () => options });
    }

    static forRootAsync(options: PrismaModuleAsyncOptions): DynamicModule {
        return {
            module: PrismaModule,
            providers: [
                { provide: PRISMA_MODULE_OPTIONS, ...options },
                {
                    provide: PrismaService,
                    inject: [PRISMA_MODULE_OPTIONS],
                    useFactory: ({ connectionString }: PrismaModuleOptions) =>
                        new PrismaService(connectionString),
                },
                {
                    provide: UnitOfWork,
                    inject: [PrismaService, PRISMA_MODULE_OPTIONS],
                    useFactory: (
                        prisma: PrismaService,
                        { transaction }: PrismaModuleOptions,
                    ) => new PrismaUnitOfWork(prisma, transaction),
                },
            ],
            exports: [PrismaService, UnitOfWork],
        };
    }
}
