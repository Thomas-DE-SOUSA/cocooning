import type { PrismaService } from '@cocooning/couple-prisma/nest';

export type TestCouple = {
    readonly coupleId: string;
    readonly partnerUserIds: readonly string[];
    readonly pairingStatus: string;
    readonly invitationCode: string | null;
    readonly invitationCodeExpiresAt: Date | null;
    readonly createdAt: Date;
};

// Rows written as stored, without the domain: a spec can seed what the API could never write (corrupted data).
export async function createTestCouple(
    prisma: PrismaService,
    couple: TestCouple,
): Promise<void> {
    await prisma.includingDeleted.couple.create({
        data: {
            id: couple.coupleId,
            pairingStatus: couple.pairingStatus,
            invitationCode: couple.invitationCode,
            invitationCodeExpiresAt: couple.invitationCodeExpiresAt,
            version: 1,
            createdAt: couple.createdAt,
            updatedAt: couple.createdAt,
            partners: {
                create: couple.partnerUserIds.map((userId) => ({
                    userId,
                    joinedAt: couple.createdAt,
                })),
            },
        },
    });
}
