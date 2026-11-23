import { couplePrismaEnvSchema } from '@cocooning/couple-prisma/env';
import { PrismaService } from '@cocooning/couple-prisma/nest';

type MigrationTableRow = { readonly table: string | null };

describe('Feature: a migrated Postgres for the test suites', () => {
    const { DATABASE_POSTGRES_URL } = couplePrismaEnvSchema.parse(process.env);
    const prisma = new PrismaService(DATABASE_POSTGRES_URL);

    beforeAll(() => prisma.onModuleInit());
    afterAll(() => prisma.onModuleDestroy());

    describe('Scenario: the global setup has run', () => {
        it('gives every suite the URL of a migrated database', async () => {
            const [row] = await prisma.includingDeleted.$queryRaw<
                [MigrationTableRow]
            >`SELECT to_regclass('_prisma_migrations')::text AS table`;
            expect(row.table).toBe('_prisma_migrations');
        });
    });
});
