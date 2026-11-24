import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import type { InstantPhotoContentType } from '@cocooning/couple-shared-kernel/enums';
import { AggregateRoot, EntityMetadata } from '@cocooning/shared-kernel/domain';
import { InstantPhotoSentEvent } from '../events/instant-photo-sent.event';
import { InstantPhotoWithdrawnEvent } from '../events/instant-photo-withdrawn.event';
import { eventParamsOf } from '../events/messaging-event-params';
import { MessagingException } from '../exceptions/messaging.exception';
import { InstantPhotoId } from '../value-objects/instant-photo-id.vo';
import type {
    InstantPhotoProps,
    InstantPhotoSnapshot,
    SendInstantPhotoInput,
} from './instant-photo.aggregate.type';

const INITIAL_VERSION = 1;

// The aggregate keeps what the feed shows of a photo; its bytes live in the file storage, under fileKey.
export class InstantPhoto extends AggregateRoot {
    private constructor(private readonly props: InstantPhotoProps) {
        super();
    }

    // R1: the photo belongs to the couple and to the partner who sends it.
    static send(input: SendInstantPhotoInput, now: Date): InstantPhoto {
        const instantPhoto = new InstantPhoto({
            ...input,
            id: InstantPhotoId.generate(),
            version: INITIAL_VERSION,
            metadata: EntityMetadata.create(now),
        });
        const data = { ownerId: input.ownerId };
        const params = eventParamsOf(
            instantPhoto.props,
            input.ownerId,
            now,
            data,
        );
        instantPhoto.addDomainEvent(new InstantPhotoSentEvent(params));
        return instantPhoto;
    }

    // Stored data is read back without validation (domain.md rule 5).
    static fromSnapshot(snapshot: InstantPhotoSnapshot): InstantPhoto {
        return new InstantPhoto({
            ...snapshot,
            id: InstantPhotoId.from(snapshot.id),
            metadata: EntityMetadata.fromSnapshot(snapshot.metadata),
        });
    }

    // R6: only the author withdraws the photo, softly, for both partners.
    withdraw(userId: string, now: Date): void {
        if (this.props.ownerId !== userId) {
            throw new MessagingException({
                code: MessagingExceptionCodeEnum.INSTANT_PHOTO_RESERVED_TO_OWNER,
                message: 'Reserved to the author of the instant photo',
            });
        }
        this.props.metadata = this.props.metadata.recordDeletion(now);
        this.addDomainEvent(
            new InstantPhotoWithdrawnEvent(
                eventParamsOf(this.props, userId, now, null),
            ),
        );
    }

    get id(): InstantPhotoId {
        return this.props.id;
    }

    get contentType(): InstantPhotoContentType {
        return this.props.contentType;
    }

    get sentAt(): Date {
        return this.props.metadata.createdAt;
    }

    // Decision 0027: the key starts with the coupleId; it never leaves the API.
    get fileKey(): string {
        return `${this.props.coupleId}/instant-photos/${this.props.id.getValue()}`;
    }

    toSnapshot(): InstantPhotoSnapshot {
        const { id, coupleId, ownerId, contentType, version, metadata } =
            this.props;
        return {
            id: id.getValue(),
            coupleId,
            ownerId,
            contentType,
            version,
            metadata: metadata.toSnapshot(),
        };
    }
}
