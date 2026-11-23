import { setTimeout as sleep } from 'node:timers/promises';
import { couplePrismaEnvSchema } from '../env';
import { PersistenceExceptionCodeEnum } from '../errors/persistence-exception-code.enum';
import { violatedUniqueConstraint } from '../errors/violated-unique-constraint';
import { acquireTransactionalAdvisoryLock } from '../locks/acquire-transactional-advisory-lock';
import { PrismaService } from './prisma.service';

const { DATABASE_POSTGRES_URL } = couplePrismaEnvSchema.parse(process.env);
const OPTIONS = { timeout: 5_000, maxWait: 2_000 };
const LOCK_HOLD_MS = 800;
const LOCK_WAIT_MS = 100;

type CountRow = { readonly count: number };

const countProbes = async (prisma: PrismaService): Promise<number> => {
    const [row] = await prisma.current.$queryRaw<
        [CountRow]
    >`SELECT count(*)::int AS count FROM integration_probe`;
    return row.count;
};

const insertProbe = (prisma: PrismaService, name: string): Promise<number> =>
    prisma.current
        .$executeRaw`INSERT INTO integration_probe (name) VALUES (${name})`;

describe('Feature: Prisma unit of work on PostgreSQL', () => {
    const prisma = new PrismaService(DATABASE_POSTGRES_URL);
    const other = new PrismaService(DATABASE_POSTGRES_URL);

    beforeAll(async () => {
        await Promise.all([prisma.onModuleInit(), other.onModuleInit()]);
        await prisma.client
            .$executeRaw`CREATE TABLE IF NOT EXISTS integration_probe (name text CONSTRAINT integration_probe_name_key UNIQUE)`;
    });
    beforeEach(async () => {
        await prisma.client.$executeRaw`TRUNCATE integration_probe`;
    });
    afterAll(async () => {
        await prisma.client.$executeRaw`DROP TABLE IF EXISTS integration_probe`;
        await Promise.all([prisma.onModuleDestroy(), other.onModuleDestroy()]);
    });

    describe('Scenario: nested transactions', () => {
        it('join the open transaction and roll back together', async () => {
            const failure = new Error('rollback');
            await expect(
                prisma.transaction(async () => {
                    await insertProbe(prisma, 'outer');
                    await prisma.transaction(
                        () => insertProbe(prisma, 'inner'),
                        OPTIONS,
                    );
                    throw failure;
                }, OPTIONS),
            ).rejects.toBe(failure);
            await expect(countProbes(prisma)).resolves.toBe(0);
        });

        it('commit together', async () => {
            await prisma.transaction(async () => {
                await insertProbe(prisma, 'outer');
                await prisma.transaction(
                    () => insertProbe(prisma, 'inner'),
                    OPTIONS,
                );
                expect(prisma.isInTransaction).toBe(true);
            }, OPTIONS);
            await expect(countProbes(prisma)).resolves.toBe(2);
        });
    });

    describe('Scenario: a unique violation', () => {
        it('is identified by its constraint name', async () => {
            await insertProbe(prisma, 'courses');
            const error: unknown = await insertProbe(prisma, 'courses').catch(
                (caught: unknown) => caught,
            );
            expect(violatedUniqueConstraint(error)).toBe(
                'integration_probe_name_key',
            );
        });
    });

    describe('Scenario: an advisory lock outside a transaction', () => {
        it('is refused, since it would be released at once', async () => {
            await expect(
                acquireTransactionalAdvisoryLock(
                    prisma,
                    'note:couple-1:note-1',
                    LOCK_WAIT_MS,
                ),
            ).rejects.toEqual(
                expect.objectContaining({
                    code: PersistenceExceptionCodeEnum.PERSISTENCE_LOCK_OUTSIDE_TRANSACTION,
                }),
            );
        });
    });

    describe('Scenario: an advisory lock held by another transaction', () => {
        it('fails as busy after the acquire timeout', async () => {
            const holding = other.transaction(async () => {
                await acquireTransactionalAdvisoryLock(
                    other,
                    'note:couple-1:note-1',
                    LOCK_WAIT_MS,
                );
                await sleep(LOCK_HOLD_MS);
            }, OPTIONS);
            await sleep(LOCK_WAIT_MS);
            await expect(
                prisma.transaction(
                    () =>
                        acquireTransactionalAdvisoryLock(
                            prisma,
                            'note:couple-1:note-1',
                            LOCK_WAIT_MS,
                        ),
                    OPTIONS,
                ),
            ).rejects.toEqual(
                expect.objectContaining({
                    code: PersistenceExceptionCodeEnum.PERSISTENCE_LOCK_BUSY,
                }),
            );
            await holding;
        });

        it('is acquired once free, and restores the lock timeout', async () => {
            const lockTimeout = await prisma.transaction(async () => {
                await acquireTransactionalAdvisoryLock(
                    prisma,
                    'note:couple-1:note-1',
                    LOCK_WAIT_MS,
                );
                const [row] = await prisma.current.$queryRaw<
                    [{ lock_timeout: string }]
                >`SELECT current_setting('lock_timeout') AS lock_timeout`;
                return row.lock_timeout;
            }, OPTIONS);
            expect(lockTimeout).toBe('0');
        });
    });
});
