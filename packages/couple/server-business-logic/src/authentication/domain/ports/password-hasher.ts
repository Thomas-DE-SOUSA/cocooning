export abstract class PasswordHasher {
    abstract hash(password: string): Promise<string>;
    // With a null hash, the adapter still spends the time of a real check (R3).
    abstract matches(password: string, hash: string | null): Promise<boolean>;
}
