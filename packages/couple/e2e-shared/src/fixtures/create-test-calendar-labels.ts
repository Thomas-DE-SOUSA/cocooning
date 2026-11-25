import type { PrismaService } from '@cocooning/couple-prisma/nest';

export type TestCalendarLabel = {
    readonly calendarLabelId: string;
    readonly coupleId: string;
    readonly ownerId: string;
    readonly name: string;
    readonly color: string;
    readonly createdAt: Date;
    readonly deletedAt: Date | null;
};

// Rows written as stored, without the domain: a spec can seed what the API could never write (an unknown colour).
export async function createTestCalendarLabels(
    prisma: PrismaService,
    labels: ReadonlyArray<TestCalendarLabel>,
): Promise<void> {
    await prisma.includingDeleted.calendarLabel.createMany({
        data: labels.map((label) => ({
            id: label.calendarLabelId,
            coupleId: label.coupleId,
            ownerId: label.ownerId,
            name: label.name,
            color: label.color,
            version: 1,
            createdAt: label.createdAt,
            updatedAt: label.createdAt,
            deletedAt: label.deletedAt,
        })),
    });
}
