// Decision 0041: the only lookup of the context without a coupleId, since it finds that coupleId.
// Answers the couple only once it is formed; a pending or cancelled couple answers null.
export abstract class PairedCoupleProvider {
    abstract findPairedCoupleIdOf(userId: string): Promise<string | null>;
}
