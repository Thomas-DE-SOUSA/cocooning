import { driverAdapterCauseOf } from '../errors/driver-adapter-cause';
import { PersistenceExceptionCodeEnum } from '../errors/persistence-exception-code.enum';
import { PersistenceException } from '../errors/persistence.exception';
import type { PrismaService } from '../nest/prisma.service';

const LOCK_NOT_AVAILABLE = '55P03';

type LockTimeoutRow = { readonly lock_timeout: string };

const isLockTimeout = (error: unknown): boolean =>
    driverAdapterCauseOf(error)?.code === LOCK_NOT_AVAILABLE;

// Transaction-level lock only (concurrency.md rule 9): it is released with the transaction, never by hand.
// A busy lock aborts the transaction, so the caller must let the exception roll it back.
export async function acquireTransactionalAdvisoryLock(
    prisma: PrismaService,
    key: string,
    acquireTimeoutMs: number,
): Promise<void> {
    if (!prisma.isInTransaction) {
        throw new PersistenceException({
            code: PersistenceExceptionCodeEnum.PERSISTENCE_LOCK_OUTSIDE_TRANSACTION,
            message: 'A transactional advisory lock needs an open transaction',
        });
    }
    const tx = prisma.current;
    const [previous] = await tx.$queryRaw<
        [LockTimeoutRow]
    >`SELECT current_setting('lock_timeout') AS lock_timeout`;
    try {
        await tx.$executeRaw`SELECT set_config('lock_timeout', ${`${acquireTimeoutMs}ms`}, true)`;
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))`;
    } catch (error) {
        if (!isLockTimeout(error)) throw error;
        throw new PersistenceException({
            code: PersistenceExceptionCodeEnum.PERSISTENCE_LOCK_BUSY,
            message: 'Advisory lock busy',
            context: { acquireTimeoutMs },
        });
    }
    await tx.$executeRaw`SELECT set_config('lock_timeout', ${previous.lock_timeout}, true)`;
}
