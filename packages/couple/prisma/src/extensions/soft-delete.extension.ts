import { Prisma } from '../generated/prisma/client';
import { scopeToNotDeleted, type WhereClause } from './scope-to-not-deleted';
import { SOFT_DELETABLE_MODELS } from './soft-deletable-models';

const UNSCOPED_OPERATIONS: ReadonlySet<string> = new Set([
    'create',
    'createMany',
    'createManyAndReturn',
    'aggregate',
    'upsert',
]);

type QueryArgs = Readonly<Record<string, unknown>> & {
    readonly where?: WhereClause;
};

export type ModelOperation = {
    readonly model: string;
    readonly operation: string;
    readonly args: QueryArgs;
    readonly query: (args: QueryArgs) => Promise<unknown>;
};

export function scopeOperationToNotDeleted(
    { model, operation, args, query }: ModelOperation,
    softDeletableModels: ReadonlySet<string> = SOFT_DELETABLE_MODELS,
): Promise<unknown> {
    if (!softDeletableModels.has(model) || UNSCOPED_OPERATIONS.has(operation))
        return query(args);
    return query({ ...args, where: scopeToNotDeleted(args.where) });
}

export const softDeleteExtension = Prisma.defineExtension({
    name: 'soft-delete',
    query: {
        $allModels: {
            $allOperations: (params) => scopeOperationToNotDeleted(params),
        },
    },
});
