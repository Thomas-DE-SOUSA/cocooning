import { SecureRandomGenerator } from '../ports/random/secure-random-generator';

const HEX_CHARS_PER_BYTE = 2;

export class FakeSecureRandomGenerator extends SecureRandomGenerator {
    private hexCounter = 0;
    private queuedIntegers: ReadonlyArray<number> = [];

    willReturnIntegers(values: ReadonlyArray<number>): void {
        this.queuedIntegers = [...values];
    }

    override generateHex(byteCount: number): string {
        this.hexCounter += 1;
        return this.hexCounter
            .toString(16)
            .padStart(byteCount * HEX_CHARS_PER_BYTE, '0');
    }

    override generateInteger(minInclusive: number): number {
        const [next, ...rest] = this.queuedIntegers;
        this.queuedIntegers = rest;
        return next === undefined ? minInclusive : next;
    }
}
