import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { softDeleteExtension } from '../extensions/soft-delete.extension';

const createScopedClient = (base: PrismaClient) =>
    base.$extends(softDeleteExtension);

export type CouplePrismaClient = ReturnType<typeof createScopedClient>;
export type CouplePrismaTransaction = Parameters<
    Parameters<CouplePrismaClient['$transaction']>[0]
>[0];

export type CouplePrismaClients = {
    readonly includingDeleted: PrismaClient;
    readonly scoped: CouplePrismaClient;
};

// Both clients share one connection pool; only `scoped` adds the soft-delete filter.
export function createCouplePrismaClients(
    connectionString: string,
): CouplePrismaClients {
    const includingDeleted = new PrismaClient({
        adapter: new PrismaPg({ connectionString }),
    });
    return { includingDeleted, scoped: createScopedClient(includingDeleted) };
}
