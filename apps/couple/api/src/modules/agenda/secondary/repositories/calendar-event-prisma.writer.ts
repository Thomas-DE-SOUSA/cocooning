import type { PrismaService } from '@cocooning/couple-prisma/nest';
import type { CalendarEventSnapshot } from '@cocooning/couple-server-business-logic/agenda';
import { toCalendarEventState } from '../mappers';
import { calendarEventVersionConflict } from './calendar-event-version-conflict';

type Transaction = PrismaService['current'];

const FIRST_VERSION = 1;

// Create or update is decided inside the transaction; the database owns the version (concurrency.md rules 4 to 6).
export async function writeCalendarEvent(
    tx: Transaction,
    snapshot: CalendarEventSnapshot,
): Promise<void> {
    const stored = await tx.calendarEvent.findFirst({
        where: { coupleId: snapshot.coupleId, id: snapshot.id },
        select: { version: true },
    });
    if (stored === null) {
        await tx.calendarEvent.create({
            data: {
                id: snapshot.id,
                coupleId: snapshot.coupleId,
                ownerId: snapshot.ownerId,
                createdAt: new Date(snapshot.metadata.createdAt),
                version: FIRST_VERSION,
                ...toCalendarEventState(snapshot),
            },
        });
        return;
    }
    const { count } = await tx.calendarEvent.updateMany({
        where: {
            coupleId: snapshot.coupleId,
            id: snapshot.id,
            version: snapshot.version,
        },
        data: { ...toCalendarEventState(snapshot), version: { increment: 1 } },
    });
    if (count === 0) throw calendarEventVersionConflict();
}
