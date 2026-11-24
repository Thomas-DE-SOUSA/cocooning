import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import type { DomainEvent } from '@cocooning/shared-kernel/domain';
import { MessagingException } from '../../../domain/exceptions/messaging.exception';
import { InstantPhoto } from '../../../domain/models/instant-photo.aggregate';
import type { InstantPhotoSnapshot } from '../../../domain/models/instant-photo.aggregate.type';
import { InstantPhotoRepository } from '../../../domain/ports/instant-photo.repository';
import { InMemoryMessageStore } from './in-memory-message.store';

export class InstantPhotoInMemoryRepository extends InstantPhotoRepository {
    private readonly store = new InMemoryMessageStore<InstantPhotoSnapshot>(
        () =>
            new MessagingException({
                code: MessagingExceptionCodeEnum.INSTANT_PHOTO_VERSION_CONFLICT,
                message: 'In-memory INSTANT_PHOTO_VERSION_CONFLICT',
            }),
    );

    get persistedEvents(): ReadonlyArray<DomainEvent> {
        return this.store.persistedEvents;
    }

    get storedSnapshots(): ReadonlyArray<InstantPhotoSnapshot> {
        return this.store.storedSnapshots;
    }

    seed(instantPhoto: InstantPhoto): void {
        this.store.seed(instantPhoto.toSnapshot());
    }

    simulateConcurrentSave(instantPhoto: InstantPhoto): void {
        this.store.simulateConcurrentSave(instantPhoto.toSnapshot());
    }

    override save(instantPhoto: InstantPhoto): Promise<void> {
        return Promise.resolve().then(() =>
            this.store.write(
                instantPhoto.toSnapshot(),
                instantPhoto.getDomainEvents(),
            ),
        );
    }

    override findById(
        coupleId: string,
        instantPhotoId: string,
    ): Promise<InstantPhoto | null> {
        const found = this.store.findLive(coupleId, instantPhotoId);
        return Promise.resolve(
            found === null ? null : InstantPhoto.fromSnapshot(found),
        );
    }

    override findNewest(
        coupleId: string,
        before: string | null,
        count: number,
    ): Promise<ReadonlyArray<InstantPhoto>> {
        return Promise.resolve(
            this.store
                .findNewest(coupleId, before, count)
                .map((snapshot) => InstantPhoto.fromSnapshot(snapshot)),
        );
    }
}
