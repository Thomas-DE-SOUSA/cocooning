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
import type { PhotoPromptAnswer } from './photo-of-the-day';

const INITIAL_VERSION = 1;

// A spontaneous photo answers no prompt and is never late (R8, R9).
const SPONTANEOUS = { photoPromptId: null, isLate: false } as const;

// The aggregate keeps what the feed shows of a photo; its bytes live in the file storage, under fileKey.
export class InstantPhoto extends AggregateRoot {
    private constructor(private readonly props: InstantPhotoProps) {
        super();
    }

    // R1: the photo belongs to the couple and to the partner who sends it.
    static send(input: SendInstantPhotoInput, now: Date): InstantPhoto {
        return InstantPhoto.sendAs(input, SPONTANEOUS, now);
    }

    // R8: the photo of the day answers the prompt, late or not; one per partner (unique index of the adapter).
    static answer(
        input: SendInstantPhotoInput,
        answer: PhotoPromptAnswer,
        now: Date,
    ): InstantPhoto {
        return InstantPhoto.sendAs(input, answer, now);
    }

    // Stored data is read back without validation (domain.md rule 5).
    static fromSnapshot(snapshot: InstantPhotoSnapshot): InstantPhoto {
        return new InstantPhoto({
            ...snapshot,
            id: InstantPhotoId.from(snapshot.id),
            metadata: EntityMetadata.fromSnapshot(snapshot.metadata),
        });
    }

    private static sendAs(
        input: SendInstantPhotoInput,
        answer: PhotoPromptAnswer | typeof SPONTANEOUS,
        now: Date,
    ): InstantPhoto {
        const instantPhoto = new InstantPhoto({
            ...input,
            ...answer,
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

    get ownerId(): string {
        return this.props.ownerId;
    }

    get photoPromptId(): string | null {
        return this.props.photoPromptId;
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
        const { id, metadata, ...rest } = this.props;
        return { ...rest, id: id.getValue(), metadata: metadata.toSnapshot() };
    }
}
