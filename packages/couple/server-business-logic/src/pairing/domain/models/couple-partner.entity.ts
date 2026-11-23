import { Entity } from '@cocooning/shared-kernel/domain';

type CouplePartnerProps = {
    readonly userId: string;
    readonly joinedAt: Date;
};

export type CouplePartnerSnapshot = {
    readonly userId: string;
    readonly joinedAt: string;
};

export class CouplePartner extends Entity {
    private constructor(private readonly props: CouplePartnerProps) {
        super();
        Object.freeze(this);
    }

    static join(userId: string, joinedAt: Date): CouplePartner {
        return new CouplePartner({ userId, joinedAt });
    }

    static fromSnapshot(snapshot: CouplePartnerSnapshot): CouplePartner {
        return new CouplePartner({
            userId: snapshot.userId,
            joinedAt: new Date(snapshot.joinedAt),
        });
    }

    isUser(userId: string): boolean {
        return this.props.userId === userId;
    }

    get userId(): string {
        return this.props.userId;
    }

    get joinedAt(): Date {
        return new Date(this.props.joinedAt.getTime());
    }

    toSnapshot(): CouplePartnerSnapshot {
        return {
            userId: this.props.userId,
            joinedAt: this.props.joinedAt.toISOString(),
        };
    }
}
