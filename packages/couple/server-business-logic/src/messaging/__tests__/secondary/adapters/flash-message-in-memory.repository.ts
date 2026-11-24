import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import type { DomainEvent } from '@cocooning/shared-kernel/domain';
import { MessagingException } from '../../../domain/exceptions/messaging.exception';
import { FlashMessage } from '../../../domain/models/flash-message.aggregate';
import type { FlashMessageSnapshot } from '../../../domain/models/flash-message.aggregate.type';
import { FlashMessageRepository } from '../../../domain/ports/flash-message.repository';
import { InMemoryMessageStore } from './in-memory-message.store';

export class FlashMessageInMemoryRepository extends FlashMessageRepository {
    private readonly store = new InMemoryMessageStore<FlashMessageSnapshot>(
        () =>
            new MessagingException({
                code: MessagingExceptionCodeEnum.FLASH_MESSAGE_VERSION_CONFLICT,
                message: 'In-memory FLASH_MESSAGE_VERSION_CONFLICT',
            }),
    );

    get persistedEvents(): ReadonlyArray<DomainEvent> {
        return this.store.persistedEvents;
    }

    get storedSnapshots(): ReadonlyArray<FlashMessageSnapshot> {
        return this.store.storedSnapshots;
    }

    seed(flashMessage: FlashMessage): void {
        this.store.seed(flashMessage.toSnapshot());
    }

    simulateConcurrentSave(flashMessage: FlashMessage): void {
        this.store.simulateConcurrentSave(flashMessage.toSnapshot());
    }

    override save(flashMessage: FlashMessage): Promise<void> {
        return Promise.resolve().then(() =>
            this.store.write(
                flashMessage.toSnapshot(),
                flashMessage.getDomainEvents(),
            ),
        );
    }

    override findById(
        coupleId: string,
        flashMessageId: string,
    ): Promise<FlashMessage | null> {
        const found = this.store.findLive(coupleId, flashMessageId);
        return Promise.resolve(
            found === null ? null : FlashMessage.fromSnapshot(found),
        );
    }

    override findNewest(
        coupleId: string,
        before: string | null,
        count: number,
    ): Promise<ReadonlyArray<FlashMessage>> {
        return Promise.resolve(
            this.store
                .findNewest(coupleId, before, count)
                .map((snapshot) => FlashMessage.fromSnapshot(snapshot)),
        );
    }
}
