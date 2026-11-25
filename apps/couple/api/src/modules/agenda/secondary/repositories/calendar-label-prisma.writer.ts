import type { PrismaService } from '@cocooning/couple-prisma/nest';
import type { CalendarLabelSnapshot } from '@cocooning/couple-server-business-logic/agenda';
import { toCalendarLabelState } from '../mappers';
import { calendarLabelVersionConflict } from './calendar-label-version-conflict';

type Transaction = PrismaService['current'];

const FIRST_VERSION = 1;

// Create or update is decided inside the transaction; the database owns the version (concurrency.md rules 4 to 6).
export async function writeCalendarLabel(
    tx: Transaction,
    snapshot: CalendarLabelSnapshot,
): Promise<void> {
    const stored = await tx.calendarLabel.findFirst({
        where: { coupleId: snapshot.coupleId, id: snapshot.id },
        select: { version: true },
    });
    if (stored === null) {
        await tx.calendarLabel.create({
            data: {
                id: snapshot.id,
                coupleId: snapshot.coupleId,
                ownerId: snapshot.ownerId,
                createdAt: new Date(snapshot.metadata.createdAt),
                version: FIRST_VERSION,
                ...toCalendarLabelState(snapshot),
            },
        });
        return;
    }
    const { count } = await tx.calendarLabel.updateMany({
        where: {
            coupleId: snapshot.coupleId,
            id: snapshot.id,
            version: snapshot.version,
        },
        data: { ...toCalendarLabelState(snapshot), version: { increment: 1 } },
    });
    if (count === 0) throw calendarLabelVersionConflict();
}
