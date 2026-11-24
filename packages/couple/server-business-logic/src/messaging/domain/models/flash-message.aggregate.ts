import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { AggregateRoot, EntityMetadata } from '@cocooning/shared-kernel/domain';
import { FlashMessageSentEvent } from '../events/flash-message-sent.event';
import { FlashMessageWithdrawnEvent } from '../events/flash-message-withdrawn.event';
import { eventParamsOf } from '../events/messaging-event-params';
import { MessagingException } from '../exceptions/messaging.exception';
import { FlashMessageId } from '../value-objects/flash-message-id.vo';
import { FlashMessageText } from '../value-objects/flash-message-text.vo';
import type {
    FlashMessageProps,
    FlashMessageSnapshot,
    SendFlashMessageInput,
} from './flash-message.aggregate.type';

const INITIAL_VERSION = 1;

export class FlashMessage extends AggregateRoot {
    private constructor(private readonly props: FlashMessageProps) {
        super();
    }

    // R1: the word belongs to the couple and to the partner who sends it.
    static send(input: SendFlashMessageInput, now: Date): FlashMessage {
        const flashMessage = new FlashMessage({
            ...input,
            id: FlashMessageId.generate(),
            version: INITIAL_VERSION,
            metadata: EntityMetadata.create(now),
        });
        const data = { ownerId: input.ownerId };
        const params = eventParamsOf(
            flashMessage.props,
            input.ownerId,
            now,
            data,
        );
        flashMessage.addDomainEvent(new FlashMessageSentEvent(params));
        return flashMessage;
    }

    // Stored data is read back without validation (domain.md rule 5).
    static fromSnapshot(snapshot: FlashMessageSnapshot): FlashMessage {
        return new FlashMessage({
            ...snapshot,
            id: FlashMessageId.from(snapshot.id),
            text: FlashMessageText.from(snapshot.text),
            metadata: EntityMetadata.fromSnapshot(snapshot.metadata),
        });
    }

    // R6: only the author withdraws the word, softly, for both partners.
    withdraw(userId: string, now: Date): void {
        if (this.props.ownerId !== userId) {
            throw new MessagingException({
                code: MessagingExceptionCodeEnum.FLASH_MESSAGE_RESERVED_TO_OWNER,
                message: 'Reserved to the author of the flash message',
            });
        }
        this.props.metadata = this.props.metadata.recordDeletion(now);
        this.addDomainEvent(
            new FlashMessageWithdrawnEvent(
                eventParamsOf(this.props, userId, now, null),
            ),
        );
    }

    get id(): FlashMessageId {
        return this.props.id;
    }

    get sentAt(): Date {
        return this.props.metadata.createdAt;
    }

    toSnapshot(): FlashMessageSnapshot {
        const { id, coupleId, ownerId, text, version, metadata } = this.props;
        return {
            id: id.getValue(),
            coupleId,
            ownerId,
            text: text.value,
            version,
            metadata: metadata.toSnapshot(),
        };
    }
}
