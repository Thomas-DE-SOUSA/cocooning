import { AsyncLocalStorage } from 'node:async_hooks';
import type { CouplePrismaTransaction } from './create-couple-prisma-clients';

// Carried by AsyncLocalStorage, not passed as an argument: repositories join the unit of work through ports that know nothing of Prisma.
export const prismaTransactionScope =
    new AsyncLocalStorage<CouplePrismaTransaction>();
