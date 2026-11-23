import type { PrismaService } from '@cocooning/couple-prisma/nest';

export type TestAccount = {
    readonly accountId: string;
    readonly emailAddress: string;
    readonly passwordHash: string;
    readonly sessionVersion: number;
    readonly createdAt: Date;
    readonly deletedAt: Date | null;
};

// A row written as stored, without the domain: the hash is the caller's, a deleted account can be seeded.
export async function createTestAccount(
    prisma: PrismaService,
    account: TestAccount,
): Promise<void> {
    await prisma.includingDeleted.account.create({
        data: {
            id: account.accountId,
            emailAddress: account.emailAddress,
            passwordHash: account.passwordHash,
            sessionVersion: account.sessionVersion,
            version: 1,
            createdAt: account.createdAt,
            updatedAt: account.createdAt,
            deletedAt: account.deletedAt,
        },
    });
}
