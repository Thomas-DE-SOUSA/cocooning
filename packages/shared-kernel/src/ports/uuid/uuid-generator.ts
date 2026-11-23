export abstract class UuidGenerator {
    abstract generate(): string;
    abstract isValid(value: string): boolean;
}
