export abstract class SecureRandomGenerator {
    abstract generateHex(byteCount: number): string;
    abstract generateInteger(
        minInclusive: number,
        maxExclusive: number,
    ): number;
}
