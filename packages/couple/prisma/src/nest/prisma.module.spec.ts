import { Global, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UnitOfWork } from '@cocooning/shared-kernel/ports';
import { PrismaModule, type PrismaModuleOptions } from './prisma.module';
import { PrismaService } from './prisma.service';
import { PrismaUnitOfWork } from './prisma-unit-of-work';

const DATABASE_SETTINGS = Symbol('DATABASE_SETTINGS');

@Global()
@Module({
    providers: [
        {
            provide: DATABASE_SETTINGS,
            useValue: {
                connectionString: 'postgresql://unused@localhost/unused',
                transaction: { timeout: 5_000, maxWait: 2_000 },
            } satisfies PrismaModuleOptions,
        },
    ],
    exports: [DATABASE_SETTINGS],
})
class DatabaseSettingsModule {}

describe('Feature: register the persistence module', () => {
    describe('Scenario: the options come from an injected provider', () => {
        it('provides the Prisma service and the unit of work', async () => {
            const moduleRef = await Test.createTestingModule({
                imports: [
                    DatabaseSettingsModule,
                    PrismaModule.forRootAsync({
                        inject: [DATABASE_SETTINGS],
                        useFactory: (settings: PrismaModuleOptions) => settings,
                    }),
                ],
            }).compile();
            expect(moduleRef.get(PrismaService)).toBeInstanceOf(PrismaService);
            expect(moduleRef.get(UnitOfWork)).toBeInstanceOf(PrismaUnitOfWork);
        });
    });
});
