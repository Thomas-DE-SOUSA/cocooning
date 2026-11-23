import { AggregateRoot, EntityMetadata } from '@cocooning/shared-kernel/domain';
import { AccountId } from '../value-objects/account-id.vo';
import { EmailAddress } from '../value-objects/email-address.vo';
import type {
    AccountProps,
    AccountSnapshot,
    CreateAccountInput,
    SessionClaims,
} from './account.aggregate.type';

const INITIAL_VERSION = 1;
const INITIAL_SESSION_VERSION = 1;
const MILLISECONDS_PER_DAY = 86_400_000;

// No domain event yet: nothing consumes one (gap 001 of docs/couple/gaps/authentication.md).
export class Account extends AggregateRoot {
    private constructor(private readonly props: AccountProps) {
        super();
    }

    static create(input: CreateAccountInput, now: Date): Account {
        return new Account({
            id: AccountId.generate(),
            emailAddress: input.emailAddress,
            passwordHash: input.passwordHash,
            sessionVersion: INITIAL_SESSION_VERSION,
            version: INITIAL_VERSION,
            metadata: EntityMetadata.create(now),
        });
    }

    static fromSnapshot(snapshot: AccountSnapshot): Account {
        return new Account({
            id: AccountId.from(snapshot.id),
            emailAddress: EmailAddress.from(snapshot.emailAddress),
            passwordHash: snapshot.passwordHash,
            sessionVersion: snapshot.sessionVersion,
            version: snapshot.version,
            metadata: EntityMetadata.fromSnapshot(snapshot.metadata),
        });
    }

    // R4: a session lasts a fixed number of days from sign-in.
    openSession(now: Date, sessionLifetimeInDays: number): SessionClaims {
        return {
            userId: this.props.id.getValue(),
            sessionVersion: this.props.sessionVersion,
            expiresAt: new Date(
                now.getTime() + sessionLifetimeInDays * MILLISECONDS_PER_DAY,
            ),
        };
    }

    // R5: signing out closes every session of the partner, on every device.
    revokeSessions(now: Date): void {
        this.props.sessionVersion = this.props.sessionVersion + 1;
        this.props.metadata = this.props.metadata.recordUpdate(now);
    }

    acceptsSession(claims: SessionClaims): boolean {
        return (
            claims.userId === this.props.id.getValue() &&
            claims.sessionVersion === this.props.sessionVersion
        );
    }

    get id(): AccountId {
        return this.props.id;
    }

    get emailAddress(): EmailAddress {
        return this.props.emailAddress;
    }

    get passwordHash(): string {
        return this.props.passwordHash;
    }

    toSnapshot(): AccountSnapshot {
        return {
            id: this.props.id.getValue(),
            emailAddress: this.props.emailAddress.value,
            passwordHash: this.props.passwordHash,
            sessionVersion: this.props.sessionVersion,
            version: this.props.version,
            metadata: this.props.metadata.toSnapshot(),
        };
    }
}
