import type { Prisma } from '@cocooning/couple-prisma/client';

// The creator first: partners come back in the order they joined.
export const COUPLE_INCLUDE = {
    partners: { orderBy: [{ joinedAt: 'asc' }, { userId: 'asc' }] },
} as const satisfies Prisma.CoupleInclude;

export type CouplePrismaPayload = Prisma.CoupleGetPayload<{
    include: typeof COUPLE_INCLUDE;
}>;
