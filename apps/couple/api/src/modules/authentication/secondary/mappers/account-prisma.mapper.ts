import type { Account as AccountRow } from '@cocooning/couple-prisma/client';
import type { AccountSnapshot } from '@cocooning/couple-server-business-logic/authentication';

export type AccountStateColumns = {
    readonly emailAddress: string;
    readonly passwordHash: string;
    readonly sessionVersion: number;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
};

// Every column is typed and required by the schema: nothing to reject when rebuilding an account.
export function toAccountSnapshot(raw: AccountRow): AccountSnapshot {
    return {
        id: raw.id,
        emailAddress: raw.emailAddress,
        passwordHash: raw.passwordHash,
        sessionVersion: raw.sessionVersion,
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
export function toAccountState(snapshot: AccountSnapshot): AccountStateColumns {
    const { metadata } = snapshot;
    return {
        emailAddress: snapshot.emailAddress,
        passwordHash: snapshot.passwordHash,
        sessionVersion: snapshot.sessionVersion,
        updatedAt: new Date(metadata.updatedAt),
        deletedAt:
            metadata.deletedAt === null ? null : new Date(metadata.deletedAt),
    };
}
