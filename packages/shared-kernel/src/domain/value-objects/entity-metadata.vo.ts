import { SharedKernelException } from '../../exceptions/shared-kernel.exception';
import { SharedKernelExceptionCodeEnum } from '../../exceptions/shared-kernel-exception-code.enum';
import { ValueObject } from '../primitives/value-object';

type EntityMetadataProps = {
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
};

export type EntityMetadataSnapshot = {
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly deletedAt: string | null;
};

const parseDate = (value: string, field: string): Date => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new SharedKernelException({
            code: SharedKernelExceptionCodeEnum.METADATA_DATA_CORRUPTED,
            message: `Invalid ${field} in entity metadata`,
        });
    }
    return date;
};

export class EntityMetadata extends ValueObject<EntityMetadataProps> {
    private constructor(props: EntityMetadataProps) {
        super(props);
        Object.freeze(this);
    }

    static create(createdAt: Date): EntityMetadata {
        return new EntityMetadata({
            createdAt,
            updatedAt: createdAt,
            deletedAt: null,
        });
    }

    static fromSnapshot(snapshot: EntityMetadataSnapshot): EntityMetadata {
        return new EntityMetadata({
            createdAt: parseDate(snapshot.createdAt, 'createdAt'),
            updatedAt: parseDate(snapshot.updatedAt, 'updatedAt'),
            deletedAt:
                snapshot.deletedAt === null
                    ? null
                    : parseDate(snapshot.deletedAt, 'deletedAt'),
        });
    }

    recordUpdate(updatedAt: Date): EntityMetadata {
        return new EntityMetadata({ ...this.props, updatedAt });
    }

    recordDeletion(deletedAt: Date): EntityMetadata {
        return new EntityMetadata({
            ...this.props,
            updatedAt: deletedAt,
            deletedAt,
        });
    }

    isDeleted(): boolean {
        return this.props.deletedAt !== null;
    }

    get createdAt(): Date {
        return new Date(this.props.createdAt.getTime());
    }

    get updatedAt(): Date {
        return new Date(this.props.updatedAt.getTime());
    }

    get deletedAt(): Date | null {
        return this.props.deletedAt === null
            ? null
            : new Date(this.props.deletedAt.getTime());
    }

    toSnapshot(): EntityMetadataSnapshot {
        return {
            createdAt: this.props.createdAt.toISOString(),
            updatedAt: this.props.updatedAt.toISOString(),
            deletedAt:
                this.props.deletedAt === null
                    ? null
                    : this.props.deletedAt.toISOString(),
        };
    }
}
