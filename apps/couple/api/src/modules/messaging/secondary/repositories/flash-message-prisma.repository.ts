import { Injectable } from '@nestjs/common';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    FlashMessage,
    FlashMessageRepository,
    MessagingException,
} from '@cocooning/couple-server-business-logic/messaging';
import { Logger, UnitOfWork } from '@cocooning/shared-kernel/ports';
import { type FlashMessageRow, toFlashMessageSnapshot } from '../mappers';
import { writeFlashMessage } from './flash-message-prisma.writer';
import { appendMessagingEvents } from './messaging-event-prisma.writer';
import {
    flashMessageVersionConflict,
    toFlashMessageVersionConflict,
} from './messaging-version-conflict';
import { newestOf } from './newest-messages.query';

type FlashMessages = PrismaService['current']['flashMessage'];

const toFlashMessage = (row: FlashMessageRow): FlashMessage =>
    FlashMessage.fromSnapshot(toFlashMessageSnapshot(row));

// Withdrawn rows are filtered by the soft-delete extension; coupleId leads every where (core-backend.md rule 12).
@Injectable()
export class FlashMessagePrismaRepository extends FlashMessageRepository {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly unitOfWork: UnitOfWork,
        private readonly logger: Logger,
    ) {
        super();
        this.logger.setContext(FlashMessagePrismaRepository.name);
    }

    override async save(flashMessage: FlashMessage): Promise<void> {
        const snapshot = flashMessage.toSnapshot();
        const events = flashMessage.getDomainEvents();
        try {
            await this.unitOfWork.run(async () => {
                const tx = this.prismaService.current;
                await writeFlashMessage(
                    tx,
                    snapshot,
                    flashMessageVersionConflict,
                );
                await appendMessagingEvents(tx, snapshot.id, events);
            });
        } catch (error) {
            if (error instanceof MessagingException) throw error;
            const conflict = toFlashMessageVersionConflict(error);
            if (conflict !== null) throw conflict;
            this.logger.error('Failed to save flash message', {
                flashMessageId: snapshot.id,
                error,
            });
            throw error;
        }
    }

    override findById(
        coupleId: string,
        flashMessageId: string,
    ): Promise<FlashMessage | null> {
        return this.load({ flashMessageId }, async (flashMessages) => {
            const row = await flashMessages.findFirst({
                where: { coupleId, id: flashMessageId },
            });
            return row === null ? null : toFlashMessage(row);
        });
    }

    override findNewest(
        coupleId: string,
        before: string | null,
        count: number,
    ): Promise<ReadonlyArray<FlashMessage>> {
        return this.load({ coupleId }, async (flashMessages) => {
            const rows = await flashMessages.findMany(
                newestOf(coupleId, before, count),
            );
            return rows.map(toFlashMessage);
        });
    }

    // Logged by identifiers only: the text belongs to the couple (core.md rule 33).
    private async load<T>(
        logContext: Record<string, string>,
        read: (flashMessages: FlashMessages) => Promise<T>,
    ): Promise<T> {
        try {
            return await read(this.prismaService.current.flashMessage);
        } catch (error) {
            if (error instanceof MessagingException) throw error;
            this.logger.error('Failed to load flash messages', {
                ...logContext,
                error,
            });
            throw error;
        }
    }
}
