import { Injectable } from '@nestjs/common';
import { PasswordHasher } from '@cocooning/couple-server-business-logic/authentication';
import { Logger } from '@cocooning/shared-kernel/ports';
import { argon2id, hash, verify } from 'argon2';

// An Argon2id hash of a discarded value, with the default cost: checked when the address matches no account (R3).
const UNKNOWN_ACCOUNT_HASH =
    '$argon2id$v=19$m=65536,t=3,p=4$loCpMEGM+hVzgDs9h83nnA$f5HKpi17e3Y6B6wMgzwa0hDcmPMn6PhvRowJlubp/0U';

@Injectable()
export class Argon2PasswordHasher extends PasswordHasher {
    constructor(private readonly logger: Logger) {
        super();
        this.logger.setContext(Argon2PasswordHasher.name);
    }

    override hash(password: string): Promise<string> {
        return hash(password, { type: argon2id });
    }

    override async matches(
        password: string,
        passwordHash: string | null,
    ): Promise<boolean> {
        if (passwordHash === null) {
            await this.verify(UNKNOWN_ACCOUNT_HASH, password);
            return false;
        }
        return this.verify(passwordHash, password);
    }

    // A stored hash Argon2 cannot read is corrupted data: logged, never answered as a wrong password.
    private async verify(
        passwordHash: string,
        password: string,
    ): Promise<boolean> {
        try {
            return await verify(passwordHash, password);
        } catch (error) {
            this.logger.error('Failed to verify password', { error });
            throw error;
        }
    }
}
