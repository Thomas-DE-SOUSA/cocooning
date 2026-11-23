import { acquireTransactionalAdvisoryLock } from '@cocooning/couple-prisma/locks';
import { PrismaService } from '@cocooning/couple-prisma/nest';

const HOLDER_TRANSACTION = { timeout: 10_000, maxWait: 2_000 };
const HOLDER_ACQUIRE_TIMEOUT_MS = 1_000;

function holdLock(
    holder: PrismaService,
    key: string,
    released: Promise<void>,
): { readonly acquired: Promise<void>; readonly holding: Promise<void> } {
    const acquisition = Promise.withResolvers<void>();
    const holding = holder.transaction(async () => {
        await acquireTransactionalAdvisoryLock(
            holder,
            key,
            HOLDER_ACQUIRE_TIMEOUT_MS,
        );
        acquisition.resolve();
        await released;
    }, HOLDER_TRANSACTION);
    return { acquired: Promise.race([acquisition.promise, holding]), holding };
}

// Holds the lock from its own connection, as another request would, until the work settles.
// The work runs outside the holder's transaction: the transaction scope is shared by every PrismaService of the process.
export async function whileAdvisoryLockHeld<T>(
    databaseUrl: string,
    key: string,
    work: () => Promise<T>,
): Promise<T> {
    const holder = new PrismaService(databaseUrl);
    await holder.onModuleInit();
    const release = Promise.withResolvers<void>();
    try {
        const { acquired, holding } = holdLock(holder, key, release.promise);
        await acquired;
        try {
            return await work();
        } finally {
            release.resolve();
            await holding;
        }
    } finally {
        await holder.onModuleDestroy();
    }
}
