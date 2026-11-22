import {
    Injectable,
    type OnModuleDestroy,
    type OnModuleInit,
} from '@nestjs/common';
import { PersistenceExceptionCodeEnum } from '../errors/persistence-exception-code.enum';
import { PersistenceException } from '../errors/persistence.exception';
import type { PrismaClient } from '../generated/prisma/client';
import {
    type CouplePrismaClient,
    type CouplePrismaClients,
    type CouplePrismaTransaction,
    createCouplePrismaClients,
} from '../transaction/create-couple-prisma-clients';
import { prismaTransactionScope } from '../transaction/prisma-transaction.scope';

export type TransactionOptions = {
    readonly timeout: number;
    readonly maxWait: number;
};

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
    private clients: CouplePrismaClients | null = null;

    constructor(private readonly connectionString: string) {}

    async onModuleInit(): Promise<void> {
        const clients = createCouplePrismaClients(this.connectionString);
        await clients.includingDeleted.$connect();
        this.clients = clients;
    }

    async onModuleDestroy(): Promise<void> {
        if (this.clients === null) return;
        await this.clients.includingDeleted.$disconnect();
        this.clients = null;
    }

    get client(): CouplePrismaClient {
        return this.requireClients().scoped;
    }

    // Reads that must see soft-deleted rows, each with its own explicit deletedAt filter. Never for writes.
    get includingDeleted(): PrismaClient {
        return this.requireClients().includingDeleted;
    }

    get current(): CouplePrismaTransaction | CouplePrismaClient {
        return prismaTransactionScope.getStore() ?? this.client;
    }

    get isInTransaction(): boolean {
        return prismaTransactionScope.getStore() !== undefined;
    }

    async transaction<T>(
        work: () => Promise<T>,
        options: TransactionOptions,
    ): Promise<T> {
        if (this.isInTransaction) return work();
        return this.client.$transaction(
            (tx) => prismaTransactionScope.run(tx, work),
            options,
        );
    }

    private requireClients(): CouplePrismaClients {
        if (this.clients === null) {
            throw new PersistenceException({
                code: PersistenceExceptionCodeEnum.PERSISTENCE_NOT_INITIALIZED,
                message: 'PrismaService used before onModuleInit',
            });
        }
        return this.clients;
    }
}
