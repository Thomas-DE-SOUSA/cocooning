import { Injectable } from '@nestjs/common';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    AgendaException,
    CalendarLabel,
    CalendarLabelRepository,
} from '@cocooning/couple-server-business-logic/agenda';
import { Logger, UnitOfWork } from '@cocooning/shared-kernel/ports';
import { type CalendarLabelRow, toCalendarLabelSnapshot } from '../mappers';
import { appendAgendaEvents } from './agenda-event-prisma.writer';
import { writeCalendarLabel } from './calendar-label-prisma.writer';
import { toCalendarLabelVersionConflict } from './calendar-label-version-conflict';

type CalendarLabels = PrismaService['current']['calendarLabel'];

const toCalendarLabel = (row: CalendarLabelRow): CalendarLabel =>
    CalendarLabel.fromSnapshot(toCalendarLabelSnapshot(row));

// The soft-delete extension hides deleted labels from every read (prisma.md rule 8).
@Injectable()
export class CalendarLabelPrismaRepository extends CalendarLabelRepository {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly unitOfWork: UnitOfWork,
        private readonly logger: Logger,
    ) {
        super();
        this.logger.setContext(CalendarLabelPrismaRepository.name);
    }

    // State and events in one transaction, joined by an open unit of work (concurrency.md rule 2).
    override async save(label: CalendarLabel): Promise<void> {
        const snapshot = label.toSnapshot();
        const events = label.getDomainEvents();
        try {
            await this.unitOfWork.run(async () => {
                const tx = this.prismaService.current;
                await writeCalendarLabel(tx, snapshot);
                await appendAgendaEvents(tx, snapshot.id, events);
            });
        } catch (error) {
            if (error instanceof AgendaException) throw error;
            const conflict = toCalendarLabelVersionConflict(error);
            if (conflict !== null) throw conflict;
            this.logger.error('Failed to save calendar label', {
                calendarLabelId: snapshot.id,
                error,
            });
            throw error;
        }
    }

    override findById(
        coupleId: string,
        calendarLabelId: string,
    ): Promise<CalendarLabel | null> {
        return this.load({ calendarLabelId }, async (labels) => {
            const row = await labels.findFirst({
                where: { coupleId, id: calendarLabelId },
            });
            return row === null ? null : toCalendarLabel(row);
        });
    }

    override findAll(coupleId: string): Promise<ReadonlyArray<CalendarLabel>> {
        return this.load({ coupleId }, async (labels) => {
            const rows = await labels.findMany({
                where: { coupleId },
                orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
            });
            return rows.map(toCalendarLabel);
        });
    }

    override countLive(coupleId: string): Promise<number> {
        return this.load({ coupleId }, (labels) =>
            labels.count({ where: { coupleId } }),
        );
    }

    // Logged by identifiers only: a label's name belongs to the couple (core.md rule 33).
    private async load<T>(
        logContext: Record<string, string>,
        read: (labels: CalendarLabels) => Promise<T>,
    ): Promise<T> {
        try {
            return await read(this.prismaService.current.calendarLabel);
        } catch (error) {
            if (error instanceof AgendaException) throw error;
            this.logger.error('Failed to load calendar labels', {
                ...logContext,
                error,
            });
            throw error;
        }
    }
}
