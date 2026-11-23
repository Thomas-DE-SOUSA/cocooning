import type { PrismaService } from '@cocooning/couple-prisma/nest';

// Built in the database: a table name cannot be a query parameter, and $executeRawUnsafe is forbidden (adapters.md rule 8).
export async function truncateAllTables(prisma: PrismaService): Promise<void> {
    await prisma.includingDeleted.$executeRaw`
        DO $$
        DECLARE
            tables text;
        BEGIN
            SELECT string_agg(format('%I.%I', schemaname, tablename), ', ')
            INTO tables
            FROM pg_tables
            WHERE schemaname = current_schema() AND tablename <> '_prisma_migrations';
            IF tables IS NOT NULL THEN
                EXECUTE 'TRUNCATE ' || tables || ' RESTART IDENTITY CASCADE';
            END IF;
        END $$`;
}
