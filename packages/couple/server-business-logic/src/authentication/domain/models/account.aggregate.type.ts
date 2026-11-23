import type {
    EntityMetadata,
    EntityMetadataSnapshot,
} from '@cocooning/shared-kernel/domain';
import type { AccountId } from '../value-objects/account-id.vo';
import type { EmailAddress } from '../value-objects/email-address.vo';

export type AccountProps = {
    readonly id: AccountId;
    readonly emailAddress: EmailAddress;
    readonly passwordHash: string;
    sessionVersion: number;
    readonly version: number;
    metadata: EntityMetadata;
};

export type CreateAccountInput = {
    readonly emailAddress: EmailAddress;
    readonly passwordHash: string;
};

export type AccountSnapshot = {
    readonly id: string;
    readonly emailAddress: string;
    readonly passwordHash: string;
    readonly sessionVersion: number;
    readonly version: number;
    readonly metadata: EntityMetadataSnapshot;
};

export type SessionClaims = {
    readonly userId: string;
    readonly sessionVersion: number;
    readonly expiresAt: Date;
};
