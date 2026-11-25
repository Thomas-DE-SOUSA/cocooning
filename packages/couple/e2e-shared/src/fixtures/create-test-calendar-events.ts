import type { PrismaService } from '@cocooning/couple-prisma/nest';

export type TestCalendarEvent = {
    readonly calendarEventId: string;
    readonly coupleId: string;
    readonly ownerId: string;
    readonly title: string;
    readonly startsOn: string;
    readonly endsOn: string | null;
    readonly visibility: string;
    readonly audience: string;
    readonly labelId: string | null;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
};

const dayColumn = (day: string): Date => new Date(`${day}T00:00:00.000Z`);

// Rows written as stored, without the domain: a spec can seed what the API could never write (corrupted data).
export async function createTestCalendarEvents(
    prisma: PrismaService,
    calendarEvents: ReadonlyArray<TestCalendarEvent>,
): Promise<void> {
    await prisma.includingDeleted.calendarEvent.createMany({
        data: calendarEvents.map((calendarEvent) => ({
            id: calendarEvent.calendarEventId,
            coupleId: calendarEvent.coupleId,
            ownerId: calendarEvent.ownerId,
            title: calendarEvent.title,
            startsOn: dayColumn(calendarEvent.startsOn),
            endsOn:
                calendarEvent.endsOn === null
                    ? null
                    : dayColumn(calendarEvent.endsOn),
            visibility: calendarEvent.visibility,
            audience: calendarEvent.audience,
            labelId: calendarEvent.labelId,
            version: 1,
            createdAt: calendarEvent.updatedAt,
            updatedAt: calendarEvent.updatedAt,
            deletedAt: calendarEvent.deletedAt,
        })),
    });
}
