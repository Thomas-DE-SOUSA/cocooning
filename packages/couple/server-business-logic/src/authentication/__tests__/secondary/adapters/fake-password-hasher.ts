import { PasswordHasher } from '../../../domain/ports/password-hasher';

const HASH_PREFIX = 'fake-argon2id:';

// Records every check, so a spec proves an unknown address is checked like a known one.
export class FakePasswordHasher extends PasswordHasher {
    private checks: ReadonlyArray<string | null> = [];

    get checkedHashes(): ReadonlyArray<string | null> {
        return this.checks;
    }

    static hashOf(password: string): string {
        return `${HASH_PREFIX}${password}`;
    }

    override hash(password: string): Promise<string> {
        return Promise.resolve(FakePasswordHasher.hashOf(password));
    }

    override matches(password: string, hash: string | null): Promise<boolean> {
        this.checks = [...this.checks, hash];
        return Promise.resolve(hash === FakePasswordHasher.hashOf(password));
    }
}
