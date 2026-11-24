import { Injectable } from '@nestjs/common';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    AgendaException,
    CalendarEvent,
    CalendarEventRepository,
} from '@cocooning/couple-server-business-logic/agenda';
import { Logger, UnitOfWork } from '@cocooning/shared-kernel/ports';
import { type CalendarEventRow, toCalendarEventSnapshot } from '../mappers';
import { appendAgendaEvents } from './agenda-event-prisma.writer';
import {
    DAY_ORDER,
    overlapping,
    visibleTo,
} from './calendar-event-prisma.filters';
import { writeCalendarEvent } from './calendar-event-prisma.writer';
import { toCalendarEventVersionConflict } from './calendar-event-version-conflict';

type CalendarEvents = PrismaService['current']['calendarEvent'];

const toCalendarEvent = (row: CalendarEventRow): CalendarEvent =>
    CalendarEvent.fromSnapshot(toCalendarEventSnapshot(row));

@Injectable()
export class CalendarEventPrismaRepository extends CalendarEventRepository {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly unitOfWork: UnitOfWork,
        private readonly logger: Logger,
    ) {
        super();
        this.logger.setContext(CalendarEventPrismaRepository.name);
    }

    // State and events in one transaction, joined by an open unit of work (concurrency.md rule 2).
    override async save(calendarEvent: CalendarEvent): Promise<void> {
        const snapshot = calendarEvent.toSnapshot();
        const events = calendarEvent.getDomainEvents();
        try {
            await this.unitOfWork.run(async () => {
                const tx = this.prismaService.current;
                await writeCalendarEvent(tx, snapshot);
                await appendAgendaEvents(tx, snapshot.id, events);
            });
        } catch (error) {
            if (error instanceof AgendaException) throw error;
            const conflict = toCalendarEventVersionConflict(error);
            if (conflict !== null) throw conflict;
            this.logger.error('Failed to save calendar event', {
                calendarEventId: snapshot.id,
                error,
            });
            throw error;
        }
    }

    override findVisibleById(
        coupleId: string,
        userId: string,
        calendarEventId: string,
    ): Promise<CalendarEvent | null> {
        return this.load({ calendarEventId }, async (calendarEvents) => {
            const row = await calendarEvents.findFirst({
                where: { ...visibleTo(coupleId, userId), id: calendarEventId },
            });
            return row === null ? null : toCalendarEvent(row);
        });
    }

    override findVisibleOverlapping(
        coupleId: string,
        userId: string,
        from: string,
        to: string,
    ): Promise<ReadonlyArray<CalendarEvent>> {
        return this.load({ coupleId }, async (calendarEvents) => {
            const rows = await calendarEvents.findMany({
                where: {
                    AND: [visibleTo(coupleId, userId), overlapping(from, to)],
                },
                orderBy: DAY_ORDER,
            });
            return rows.map(toCalendarEvent);
        });
    }

    // Logged by identifiers only: titles, descriptions and days belong to the couple (core.md rule 33).
    private async load<T>(
        logContext: Record<string, string>,
        read: (calendarEvents: CalendarEvents) => Promise<T>,
    ): Promise<T> {
        try {
            return await read(this.prismaService.current.calendarEvent);
        } catch (error) {
            if (error instanceof AgendaException) throw error;
            this.logger.error('Failed to load calendar events', {
                ...logContext,
                error,
            });
            throw error;
        }
    }
}
