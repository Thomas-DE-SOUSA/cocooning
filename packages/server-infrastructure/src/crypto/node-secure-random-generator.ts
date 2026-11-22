import { SecureRandomGenerator } from '@cocooning/shared-kernel/ports';
import { randomBytes, randomInt } from 'node:crypto';

export class NodeSecureRandomGenerator extends SecureRandomGenerator {
    override generateHex(byteCount: number): string {
        return randomBytes(byteCount).toString('hex');
    }

    override generateInteger(
        minInclusive: number,
        maxExclusive: number,
    ): number {
        return randomInt(minInclusive, maxExclusive);
    }
}
