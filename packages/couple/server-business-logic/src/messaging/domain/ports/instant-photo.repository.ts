import type { InstantPhoto } from '../models/instant-photo.aggregate';

// A withdrawn instant photo is filtered by the query, never in memory (core-backend.md rule 12).
export abstract class InstantPhotoRepository {
    abstract save(instantPhoto: InstantPhoto): Promise<void>;
    abstract findById(
        coupleId: string,
        instantPhotoId: string,
    ): Promise<InstantPhoto | null>;
    // Decision 0025: at most `count` live instant photos, newest first, older than the id `before` when given.
    abstract findNewest(
        coupleId: string,
        before: string | null,
        count: number,
    ): Promise<ReadonlyArray<InstantPhoto>>;
    // R8, R9: the live photos of the day that answer these prompts of the couple, in one query.
    abstract findOfPhotoPrompts(
        coupleId: string,
        photoPromptIds: ReadonlyArray<string>,
    ): Promise<ReadonlyArray<InstantPhoto>>;
}
