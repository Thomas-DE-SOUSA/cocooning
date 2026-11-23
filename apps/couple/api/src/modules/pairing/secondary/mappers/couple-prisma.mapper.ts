import type { Prisma } from '@cocooning/couple-prisma/client';
import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import {
    type CoupleSnapshot,
    PairingException,
} from '@cocooning/couple-server-business-logic/pairing';
import { CouplePairingStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { parseEnum } from '@cocooning/shared-kernel/utils';
import type { CouplePrismaPayload } from './couple-prisma.payload';

type InvitationCodeSnapshot = CoupleSnapshot['invitationCode'];

export type CoupleStateColumns = {
    readonly pairingStatus: string;
    readonly invitationCode: string | null;
    readonly invitationCodeExpiresAt: Date | null;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
};

const dataCorrupted = (message: string): PairingException =>
    new PairingException({
        code: PairingExceptionCodeEnum.PAIRING_COUPLE_DATA_CORRUPTED,
        message,
    });

// The code and its deadline are written and cleared together (INV-004, INV-005).
const toInvitationCodeSnapshot = ({
    invitationCode,
    invitationCodeExpiresAt,
}: CouplePrismaPayload): InvitationCodeSnapshot => {
    if (invitationCode === null && invitationCodeExpiresAt === null)
        return null;
    if (invitationCode === null || invitationCodeExpiresAt === null) {
        throw dataCorrupted('Invitation code without its deadline');
    }
    return {
        value: invitationCode,
        expiresAt: invitationCodeExpiresAt.toISOString(),
    };
};

export function toCoupleSnapshot(raw: CouplePrismaPayload): CoupleSnapshot {
    if (raw.partners.length === 0)
        throw dataCorrupted('Couple without partner');
    return {
        id: raw.id,
        pairingStatus: parseEnum(
            raw.pairingStatus,
            CouplePairingStatusEnum,
            'CouplePairingStatus',
        ),
        partners: raw.partners.map(({ userId, joinedAt }) => ({
            userId,
            joinedAt: joinedAt.toISOString(),
        })),
        invitationCode: toInvitationCodeSnapshot(raw),
        version: raw.version,
        metadata: {
            createdAt: raw.createdAt.toISOString(),
            updatedAt: raw.updatedAt.toISOString(),
            deletedAt:
                raw.deletedAt === null ? null : raw.deletedAt.toISOString(),
        },
    };
}

// The columns an update may change: never the id, the creation date or the version.
export function toCoupleState(snapshot: CoupleSnapshot): CoupleStateColumns {
    const { invitationCode, metadata } = snapshot;
    return {
        pairingStatus: snapshot.pairingStatus,
        invitationCode: invitationCode === null ? null : invitationCode.value,
        invitationCodeExpiresAt:
            invitationCode === null ? null : new Date(invitationCode.expiresAt),
        updatedAt: new Date(metadata.updatedAt),
        deletedAt:
            metadata.deletedAt === null ? null : new Date(metadata.deletedAt),
    };
}

export function toPartnerRows(
    snapshot: CoupleSnapshot,
): Prisma.CouplePartnerCreateManyInput[] {
    return snapshot.partners.map(({ userId, joinedAt }) => ({
        coupleId: snapshot.id,
        userId,
        joinedAt: new Date(joinedAt),
    }));
}
