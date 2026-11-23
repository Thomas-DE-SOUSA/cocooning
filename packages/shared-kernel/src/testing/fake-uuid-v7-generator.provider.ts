import { UuidGenerator } from '../ports/uuid/uuid-generator';

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const COUNTER_DIGITS = 12;

export class FakeUuidV7GeneratorProvider extends UuidGenerator {
    private counter = 0;

    override generate(): string {
        this.counter += 1;
        return `00000000-0000-7000-8000-${String(this.counter).padStart(COUNTER_DIGITS, '0')}`;
    }

    override isValid(value: string): boolean {
        return UUID_PATTERN.test(value);
    }
}
