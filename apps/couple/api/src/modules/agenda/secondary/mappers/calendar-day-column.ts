const ISO_DAY_LENGTH = 'YYYY-MM-DD'.length;

// A DATE column crosses Prisma as a Date at midnight UTC: the day is its UTC date, never a Paris instant (decision 0047).
export const toDayColumn = (day: string): Date =>
    new Date(`${day}T00:00:00.000Z`);

export const fromDayColumn = (column: Date): string =>
    column.toISOString().slice(0, ISO_DAY_LENGTH);
