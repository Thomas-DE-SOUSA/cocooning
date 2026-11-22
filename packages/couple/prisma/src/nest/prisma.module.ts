import { type DynamicModule, Global, Module } from '@nestjs/common';
import { UnitOfWork } from '@cocooning/shared-kernel/ports';
import { PrismaService, type TransactionOptions } from './prisma.service';
import { PrismaUnitOfWork } from './prisma-unit-of-work';

export type PrismaModuleOptions = {
    readonly connectionString: string;
    readonly transaction: TransactionOptions;
};

@Global()
@Module({})
export class PrismaModule {
    static forRoot(options: PrismaModuleOptions): DynamicModule {
        return {
            module: PrismaModule,
            providers: [
                {
                    provide: PrismaService,
                    useFactory: () =>
                        new PrismaService(options.connectionString),
                },
                {
                    provide: UnitOfWork,
                    inject: [PrismaService],
                    useFactory: (prisma: PrismaService) =>
                        new PrismaUnitOfWork(prisma, options.transaction),
                },
            ],
            exports: [PrismaService, UnitOfWork],
        };
    }
}
