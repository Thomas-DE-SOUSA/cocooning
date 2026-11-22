import { couplePrismaEnvSchema } from '@cocooning/couple-prisma/env';
import { PersistenceExceptionCodeEnum } from '@cocooning/couple-prisma/errors';
import { acquireTransactionalAdvisoryLock } from '@cocooning/couple-prisma/locks';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import { truncateAllTables } from './truncate-all-tables';
import { whileAdvisoryLockHeld } from './while-advisory-lock-held';

const TRANSACTION = { timeout: 5_000, maxWait: 2_000 };
const LOCK_KEY = 'note:00000000-0000-7000-8000-000000000001';
const LOCK_WAIT_MS = 100;

type CountRow = { readonly count: number };

describe('Feature: fixtures of the test suites', () => {
    const { DATABASE_POSTGRES_URL } = couplePrismaEnvSchema.parse(process.env);
    const prisma = new PrismaService(DATABASE_POSTGRES_URL);

    const countRows = async (): Promise<number> => {
        const [row] = await prisma.includingDeleted.$queryRaw<
            [CountRow]
        >`SELECT count(*)::int AS count FROM fixture_probe`;
        return row.count;
    };

    beforeAll(async () => {
        await prisma.onModuleInit();
        await prisma.includingDeleted
            .$executeRaw`CREATE TABLE fixture_probe (name text)`;
    });
    afterAll(async () => {
        await prisma.includingDeleted.$executeRaw`DROP TABLE fixture_probe`;
        await prisma.onModuleDestroy();
    });

    describe('Scenario: a suite leaves rows behind', () => {
        it('empties every table and keeps the migration history', async () => {
            await prisma.includingDeleted
                .$executeRaw`INSERT INTO fixture_probe (name) VALUES ('left')`;
            await truncateAllTables(prisma);
            await expect(countRows()).resolves.toBe(0);
            const [migrations] = await prisma.includingDeleted.$queryRaw<
                [CountRow]
            >`SELECT count(*)::int AS count FROM pg_tables WHERE tablename = '_prisma_migrations'`;
            expect(migrations.count).toBe(1);
        });
    });

    describe('Scenario: another request holds the lock', () => {
        it('makes the lock busy until the work settles', async () => {
            const tryLock = (): Promise<void> =>
                prisma.transaction(
                    () =>
                        acquireTransactionalAdvisoryLock(
                            prisma,
                            LOCK_KEY,
                            LOCK_WAIT_MS,
                        ),
                    TRANSACTION,
                );
            await whileAdvisoryLockHeld(DATABASE_POSTGRES_URL, LOCK_KEY, () =>
                expect(tryLock()).rejects.toMatchObject({
                    code: PersistenceExceptionCodeEnum.PERSISTENCE_LOCK_BUSY,
                }),
            );
            await expect(tryLock()).resolves.toBeUndefined();
        });
    });
});
