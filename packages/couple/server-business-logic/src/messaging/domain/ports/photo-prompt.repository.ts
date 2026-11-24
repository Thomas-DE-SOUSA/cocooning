import type { PhotoPrompt } from '../models/photo-prompt.aggregate';

export abstract class PhotoPromptRepository {
    // The prompts drawn or issued by one tick, with their events, in one transaction; (coupleId, day) is unique (R7).
    abstract saveAll(photoPrompts: ReadonlyArray<PhotoPrompt>): Promise<void>;
    abstract findById(
        coupleId: string,
        photoPromptId: string,
    ): Promise<PhotoPrompt | null>;
    // One query for the given couples (core.md rule 9): the prompt of a Paris day YYYY-MM-DD, at most one per couple.
    abstract findOfDay(
        coupleIds: ReadonlyArray<string>,
        day: string,
    ): Promise<ReadonlyArray<PhotoPrompt>>;
}
