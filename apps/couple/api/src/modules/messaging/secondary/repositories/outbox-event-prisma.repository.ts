import { Injectable } from '@nestjs/common';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    type OutboxEvent,
    OutboxEventRepository,
} from '@cocooning/couple-server-business-logic/messaging';
import { Logger } from '@cocooning/shared-kernel/ports';
import { toOutboxEvents } from '../mappers';
import { claimPendingRows } from './outbox-event-prisma.query';

// The relay's read across couples (R10): note_event, agenda_event and messaging_event, never pairing_event.
@Injectable()
export class OutboxEventPrismaRepository extends OutboxEventRepository {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly logger: Logger,
    ) {
        super();
        this.logger.setContext(OutboxEventPrismaRepository.name);
    }

    // FOR UPDATE SKIP LOCKED holds the rows for the running transaction (concurrency.md rule 13): a second relay skips them.
    override async claimPending(
        limit: number,
    ): Promise<ReadonlyArray<OutboxEvent>> {
        try {
            const rows = await claimPendingRows(
                this.prismaService.current,
                limit,
            );
            return toOutboxEvents(rows, limit);
        } catch (error) {
            this.logger.error('Failed to claim outbox events', { error });
            throw error;
        }
    }

    // Three statements whatever the batch; an id belongs to one outbox only (UUID v7 of its event).
    override async markPublished(
        events: ReadonlyArray<OutboxEvent>,
        publishedAt: Date,
    ): Promise<void> {
        if (events.length === 0) return;
        const tx = this.prismaService.current;
        const where = {
            id: { in: events.map(({ eventId }) => eventId) },
            published: false,
        };
        const data = { published: true, publishedAt };
        try {
            await tx.noteEvent.updateMany({ where, data });
            await tx.agendaEvent.updateMany({ where, data });
            await tx.messagingEvent.updateMany({ where, data });
        } catch (error) {
            this.logger.error('Failed to mark outbox events published', {
                eventCount: events.length,
                error,
            });
            throw error;
        }
    }
}
