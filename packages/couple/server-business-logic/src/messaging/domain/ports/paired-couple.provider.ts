// Decision 0041: the only lookups of the context without a coupleId, since they find that coupleId.
// Answers the couple only once it is formed; a pending or cancelled couple is not one.
export abstract class PairedCoupleProvider {
    abstract findPairedCoupleIdOf(userId: string): Promise<string | null>;
    // R7: the scheduled task of the photo prompt reads every formed couple at once, its only read across couples.
    abstract findPairedCoupleIds(): Promise<ReadonlyArray<string>>;
}
