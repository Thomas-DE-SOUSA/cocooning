import type { Prisma } from '../generated/prisma/client';

// Opt-in: a model is listed here when it has a `deletedAt` column. soft-deletable-models.spec.ts checks the list against the schema.
export const SOFT_DELETABLE_MODELS: ReadonlySet<Prisma.ModelName> =
    new Set<Prisma.ModelName>(['Couple']);
