import type { PrismaService } from '@cocooning/couple-prisma/nest';
import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import {
    type CoupleSnapshot,
    PairingException,
} from '@cocooning/couple-server-business-logic/pairing';
import { toCoupleState, toPartnerRows } from '../mappers';

type Transaction = PrismaService['current'];

const FIRST_VERSION = 1;

// Create or update is decided inside the transaction; the database owns the version (concurrency.md rules 4 to 6).
export async function writeCouple(
    tx: Transaction,
    snapshot: CoupleSnapshot,
): Promise<void> {
    const stored = await tx.couple.findFirst({
        where: { id: snapshot.id },
        select: { version: true },
    });
    if (stored === null) {
        await tx.couple.create({
            data: {
                id: snapshot.id,
                createdAt: new Date(snapshot.metadata.createdAt),
                version: FIRST_VERSION,
                ...toCoupleState(snapshot),
            },
        });
        return;
    }
    const { count } = await tx.couple.updateMany({
        where: { id: snapshot.id, version: snapshot.version },
        data: { ...toCoupleState(snapshot), version: { increment: 1 } },
    });
    if (count === 0) {
        throw new PairingException({
            code: PairingExceptionCodeEnum.PAIRING_COUPLE_VERSION_CONFLICT,
            message: 'Couple changed since it was read',
        });
    }
}

// Partners have no lifecycle of their own: rewritten with their couple (adapters.md rule 13).
// A cancelled couple keeps none, so the unique partner index lets them pair again (R8, decision 0038).
export async function writePartners(
    tx: Transaction,
    snapshot: CoupleSnapshot,
): Promise<void> {
    await tx.couplePartner.deleteMany({ where: { coupleId: snapshot.id } });
    if (snapshot.metadata.deletedAt !== null) return;
    await tx.couplePartner.createMany({ data: toPartnerRows(snapshot) });
}
