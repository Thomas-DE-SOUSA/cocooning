import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import type { DomainEvent } from '@cocooning/shared-kernel/domain';
import { MessagingException } from '../../../domain/exceptions/messaging.exception';
import { PhotoPrompt } from '../../../domain/models/photo-prompt.aggregate';
import type { PhotoPromptSnapshot } from '../../../domain/models/photo-prompt.aggregate.type';
import { PhotoPromptRepository } from '../../../domain/ports/photo-prompt.repository';

const conflict = (): MessagingException =>
    new MessagingException({
        code: MessagingExceptionCodeEnum.PHOTO_PROMPT_VERSION_CONFLICT,
        message: 'In-memory PHOTO_PROMPT_VERSION_CONFLICT',
    });

// Mimics photo_prompt and its outbox: one transaction per saveAll, optimistic version, unique (coupleId, day).
export class PhotoPromptInMemoryRepository extends PhotoPromptRepository {
    private snapshots: ReadonlyMap<string, PhotoPromptSnapshot> = new Map();
    private outbox: ReadonlyArray<DomainEvent> = [];
    private concurrentSave: PhotoPromptSnapshot | null = null;

    get persistedEvents(): ReadonlyArray<DomainEvent> {
        return this.outbox;
    }

    get storedSnapshots(): ReadonlyArray<PhotoPromptSnapshot> {
        return [...this.snapshots.values()];
    }

    seed(photoPrompt: PhotoPrompt): void {
        this.snapshots = this.written(this.snapshots, photoPrompt.toSnapshot());
    }

    simulateConcurrentSave(photoPrompt: PhotoPrompt): void {
        this.concurrentSave = photoPrompt.toSnapshot();
    }

    override saveAll(photoPrompts: ReadonlyArray<PhotoPrompt>): Promise<void> {
        return Promise.resolve().then(() => {
            const concurrent = this.concurrentSave;
            this.concurrentSave = null;
            const before =
                concurrent === null
                    ? this.snapshots
                    : this.written(this.snapshots, concurrent);
            this.snapshots = photoPrompts.reduce(
                (stored, prompt) => this.written(stored, prompt.toSnapshot()),
                before,
            );
            this.outbox = [
                ...this.outbox,
                ...photoPrompts.flatMap((prompt) => prompt.getDomainEvents()),
            ];
        });
    }

    override findById(
        coupleId: string,
        photoPromptId: string,
    ): Promise<PhotoPrompt | null> {
        const found = this.storedSnapshots.find(
            (stored) =>
                stored.coupleId === coupleId && stored.id === photoPromptId,
        );
        return Promise.resolve(
            found === undefined ? null : PhotoPrompt.fromSnapshot(found),
        );
    }

    override findOfDay(
        coupleIds: ReadonlyArray<string>,
        day: string,
    ): Promise<ReadonlyArray<PhotoPrompt>> {
        return Promise.resolve(
            this.storedSnapshots
                .filter(
                    (stored) =>
                        coupleIds.includes(stored.coupleId) &&
                        stored.day === day,
                )
                .map((stored) => PhotoPrompt.fromSnapshot(stored)),
        );
    }

    // The whole batch is refused, as the transaction would roll back.
    private written(
        stored: ReadonlyMap<string, PhotoPromptSnapshot>,
        snapshot: PhotoPromptSnapshot,
    ): ReadonlyMap<string, PhotoPromptSnapshot> {
        const current = stored.get(snapshot.id) ?? null;
        const sameDay = [...stored.values()].some(
            (other) =>
                other.id !== snapshot.id &&
                other.coupleId === snapshot.coupleId &&
                other.day === snapshot.day,
        );
        if (sameDay) throw conflict();
        if (current !== null && current.version !== snapshot.version) {
            throw conflict();
        }
        const version = current === null ? 1 : current.version + 1;
        return new Map([
            ...stored,
            [snapshot.id, structuredClone({ ...snapshot, version })],
        ]);
    }
}
