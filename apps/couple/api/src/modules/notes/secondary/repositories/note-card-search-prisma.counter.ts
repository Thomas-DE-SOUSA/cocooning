import { Injectable } from '@nestjs/common';
import { Prisma } from '@cocooning/couple-prisma/client';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import { NoteCardSearchCounter } from '@cocooning/couple-server-business-logic/notes';
import { Logger } from '@cocooning/shared-kernel/ports';

// R23: the couple lives in Paris; its day starts at midnight there, whatever the time zone of the server.
const COUPLE_TIME_ZONE = 'Europe/Paris';

type CountRow = { readonly count: number };

@Injectable()
export class NoteCardSearchPrismaCounter extends NoteCardSearchCounter {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly logger: Logger,
    ) {
        super();
        this.logger.setContext(NoteCardSearchPrismaCounter.name);
    }

    // The searched_at columns hold UTC: the midnight of Paris is turned into UTC once, so the index serves.
    override async countOfCoupleDay(
        coupleId: string,
        now: Date,
    ): Promise<number> {
        try {
            const [row] = await this.prismaService.current.$queryRaw<
                CountRow[]
            >(Prisma.sql`
                SELECT count(*)::int AS "count" FROM "note_card_search"
                WHERE "couple_id" = ${coupleId}::uuid
                  AND "searched_at" >= (date_trunc('day', ${now}::timestamptz AT TIME ZONE ${COUPLE_TIME_ZONE})
                      AT TIME ZONE ${COUPLE_TIME_ZONE}) AT TIME ZONE 'UTC'`);
            return row?.count ?? 0;
        } catch (error) {
            this.logger.error('Failed to count note card searches', {
                coupleId,
                error,
            });
            throw error;
        }
    }

    override async record(
        coupleId: string,
        noteCardId: string,
        now: Date,
    ): Promise<void> {
        try {
            await this.prismaService.current.noteCardSearch.create({
                data: { coupleId, noteCardId, searchedAt: now },
            });
        } catch (error) {
            this.logger.error('Failed to record a note card search', {
                coupleId,
                noteCardId,
                error,
            });
            throw error;
        }
    }
}
