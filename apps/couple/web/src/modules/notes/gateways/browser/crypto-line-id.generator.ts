import { LineIdGenerator } from '../ports/line-id.generator';

// The PWA runs over HTTPS (Tailscale) or on localhost: a secure context, where crypto.randomUUID exists.
export class CryptoLineIdGenerator extends LineIdGenerator {
    override next(): string {
        return crypto.randomUUID();
    }
}
