import { Prisma } from '@cocooning/couple-prisma/client';
import type { PrismaService } from '@cocooning/couple-prisma/nest';
import type { NoteCardRow } from '../mappers';

type Transaction = PrismaService['current'];

type IdRow = { readonly id: string };

// R18, R22: the cards of the live notes of a folder and of its live sub-folders, in one recursive query.
// deleted_at is written at every level: the soft-delete extension does not reach raw SQL (adapters.md rule 8).
export async function readCardsInTree(
    tx: Transaction,
    coupleId: string,
    folderId: string,
): Promise<ReadonlyArray<NoteCardRow>> {
    const rows = await tx.$queryRaw<IdRow[]>(Prisma.sql`
        WITH RECURSIVE "tree" AS (
            SELECT "id" FROM "folder"
            WHERE "couple_id" = ${coupleId}::uuid AND "id" = ${folderId}::uuid AND "deleted_at" IS NULL
            UNION
            SELECT "child"."id" FROM "folder" AS "child" JOIN "tree" ON "child"."parent_folder_id" = "tree"."id"
            WHERE "child"."couple_id" = ${coupleId}::uuid AND "child"."deleted_at" IS NULL
        )
        SELECT "card"."id" FROM "note_card" AS "card"
        JOIN "note" ON "note"."id" = "card"."note_id"
        WHERE "card"."couple_id" = ${coupleId}::uuid AND "note"."couple_id" = ${coupleId}::uuid
          AND "note"."deleted_at" IS NULL AND "note"."folder_id" IN (SELECT "id" FROM "tree")`);
    return tx.noteCard.findMany({
        where: { coupleId, id: { in: rows.map(({ id }) => id) } },
    });
}
