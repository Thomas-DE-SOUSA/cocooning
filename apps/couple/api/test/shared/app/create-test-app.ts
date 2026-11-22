import type { INestApplication, Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';

export type ProviderOverride = {
    readonly provide: abstract new (...args: never[]) => unknown;
    readonly useValue: unknown;
};

export type TestAppOptions = {
    readonly controllers: readonly Type[];
    readonly overrides: readonly ProviderOverride[];
};

const NO_OPTIONS: TestAppOptions = { controllers: [], overrides: [] };

// The real AppModule, so guards, filter and middleware are those of production. listen(0) picks a free port.
export async function createTestApp(
    options: TestAppOptions = NO_OPTIONS,
): Promise<INestApplication> {
    const builder = Test.createTestingModule({
        imports: [AppModule],
        controllers: [...options.controllers],
    });
    for (const override of options.overrides) {
        builder.overrideProvider(override.provide).useValue(override.useValue);
    }
    const moduleRef = await builder.compile();
    const app = moduleRef.createNestApplication();
    await app.listen(0);
    return app;
}

// close() stops the server first, then runs onModuleDestroy, which disconnects Prisma.
export async function closeTestApp(app: INestApplication): Promise<void> {
    await app.close();
}
