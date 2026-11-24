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

    // Mimics the partial unique index (couple_id, photo_prompt_id, owner_id) of the live photos (R8).
    override save(instantPhoto: InstantPhoto): Promise<void> {
        return Promise.resolve().then(() => {
            const snapshot = instantPhoto.toSnapshot();
            if (this.answersTwice(snapshot)) {
                throw new MessagingException({
                    code: MessagingExceptionCodeEnum.PHOTO_PROMPT_ALREADY_ANSWERED,
                    message: 'In-memory PHOTO_PROMPT_ALREADY_ANSWERED',
                });
            }
            this.store.write(snapshot, instantPhoto.getDomainEvents());
        });
    }

    override findOfPhotoPrompts(
        coupleId: string,
        photoPromptIds: ReadonlyArray<string>,
    ): Promise<ReadonlyArray<InstantPhoto>> {
        return Promise.resolve(
            this.store
                .findNewest(coupleId, null, Number.MAX_SAFE_INTEGER)
                .filter(({ photoPromptId }) =>
                    photoPromptIds.some((id) => id === photoPromptId),
                )
                .map((snapshot) => InstantPhoto.fromSnapshot(snapshot)),
        );
    }

    private answersTwice(snapshot: InstantPhotoSnapshot): boolean {
        return this.store
            .findNewest(snapshot.coupleId, null, Number.MAX_SAFE_INTEGER)
            .some(
                (stored) =>
                    stored.id !== snapshot.id &&
                    snapshot.photoPromptId !== null &&
                    stored.photoPromptId === snapshot.photoPromptId &&
                    stored.ownerId === snapshot.ownerId,
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
