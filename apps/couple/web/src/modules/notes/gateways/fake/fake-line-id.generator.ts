import { LineIdGenerator } from '../ports/line-id.generator';

// Gives line-1, line-2… so a spec knows the id of the line it adds.
export class FakeLineIdGenerator extends LineIdGenerator {
    private count = 0;

    override next(): string {
        this.count += 1;
        return `line-${this.count}`;
    }
}
