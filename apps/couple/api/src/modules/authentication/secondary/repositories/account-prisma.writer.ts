import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import type { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    type AccountSnapshot,
    AuthenticationException,
} from '@cocooning/couple-server-business-logic/authentication';
import { toAccountState } from '../mappers';

type Transaction = PrismaService['current'];

const FIRST_VERSION = 1;

// Create or update is decided inside the transaction; the database owns the version (concurrency.md rules 4 to 6).
export async function writeAccount(
    tx: Transaction,
    snapshot: AccountSnapshot,
): Promise<void> {
    const stored = await tx.account.findFirst({
        where: { id: snapshot.id },
        select: { version: true },
    });
    if (stored === null) {
        await tx.account.create({
            data: {
                id: snapshot.id,
                createdAt: new Date(snapshot.metadata.createdAt),
                version: FIRST_VERSION,
                ...toAccountState(snapshot),
            },
        });
        return;
    }
    const { count } = await tx.account.updateMany({
        where: { id: snapshot.id, version: snapshot.version },
        data: { ...toAccountState(snapshot), version: { increment: 1 } },
    });
    if (count === 0) {
        throw new AuthenticationException({
            code: AuthenticationExceptionCodeEnum.AUTHENTICATION_ACCOUNT_VERSION_CONFLICT,
            message: 'Account changed since it was read',
        });
    }
}
