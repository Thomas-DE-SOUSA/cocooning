import { Injectable } from '@nestjs/common';
import type { Prisma } from '@cocooning/couple-prisma/client';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    Account,
    AccountRepository,
    AuthenticationException,
} from '@cocooning/couple-server-business-logic/authentication';
import { Logger, UnitOfWork } from '@cocooning/shared-kernel/ports';
import { toAccountSnapshot } from '../mappers';
import { toAccountConflict } from './account-unique-constraints';
import { writeAccount } from './account-prisma.writer';

// An account precedes any couple: no coupleId in its lookups (decision 0033).
@Injectable()
export class AccountPrismaRepository extends AccountRepository {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly unitOfWork: UnitOfWork,
        private readonly logger: Logger,
    ) {
        super();
        this.logger.setContext(AccountPrismaRepository.name);
    }

    override async save(account: Account): Promise<void> {
        const snapshot = account.toSnapshot();
        try {
            await this.unitOfWork.run(() =>
                writeAccount(this.prismaService.current, snapshot),
            );
        } catch (error) {
            if (error instanceof AuthenticationException) throw error;
            const conflict = toAccountConflict(error);
            if (conflict !== null) throw conflict;
            this.logger.error('Failed to save account', {
                accountId: snapshot.id,
                error,
            });
            throw error;
        }
    }

    override findById(accountId: string): Promise<Account | null> {
        return this.findOne({ id: accountId }, 'id');
    }

    override findByEmailAddress(emailAddress: string): Promise<Account | null> {
        return this.findOne({ emailAddress }, 'emailAddress');
    }

    // Logged by the kind of lookup only: the address is personal data (core.md rule 30).
    private async findOne(
        where: Prisma.AccountWhereInput,
        lookup: string,
    ): Promise<Account | null> {
        try {
            const raw = await this.prismaService.current.account.findFirst({
                where,
            });
            return raw === null
                ? null
                : Account.fromSnapshot(toAccountSnapshot(raw));
        } catch (error) {
            this.logger.error('Failed to load account', { lookup, error });
            throw error;
        }
    }
}
