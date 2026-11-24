import { Injectable } from '@nestjs/common';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    MessagingException,
    PhotoPrompt,
    PhotoPromptRepository,
} from '@cocooning/couple-server-business-logic/messaging';
import { Logger, UnitOfWork } from '@cocooning/shared-kernel/ports';
import {
    type PhotoPromptRow,
    toDayColumn,
    toPhotoPromptSnapshot,
} from '../mappers';
import { appendMessagingEvents } from './messaging-event-prisma.writer';
import {
    photoPromptVersionConflict,
    toPhotoPromptVersionConflict,
} from './messaging-version-conflict';
import { writePhotoPrompts } from './photo-prompt-prisma.writer';

type PhotoPrompts = PrismaService['current']['photoPrompt'];

const toPhotoPrompt = (row: PhotoPromptRow): PhotoPrompt =>
    PhotoPrompt.fromSnapshot(toPhotoPromptSnapshot(row));

// coupleId leads every where (core-backend.md rule 12); the drawn time is never logged (R7).
@Injectable()
export class PhotoPromptPrismaRepository extends PhotoPromptRepository {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly unitOfWork: UnitOfWork,
        private readonly logger: Logger,
    ) {
        super();
        this.logger.setContext(PhotoPromptPrismaRepository.name);
    }

    override async saveAll(
        photoPrompts: ReadonlyArray<PhotoPrompt>,
    ): Promise<void> {
        if (photoPrompts.length === 0) return;
        const snapshots = photoPrompts.map((prompt) => prompt.toSnapshot());
        const events = photoPrompts.flatMap((prompt) =>
            prompt.getDomainEvents(),
        );
        try {
            await this.unitOfWork.run(async () => {
                const tx = this.prismaService.current;
                await writePhotoPrompts(
                    tx,
                    snapshots,
                    photoPromptVersionConflict,
                );
                await appendMessagingEvents(tx, events);
            });
        } catch (error) {
            if (error instanceof MessagingException) throw error;
            const conflict = toPhotoPromptVersionConflict(error);
            if (conflict !== null) throw conflict;
            this.logger.error('Failed to save photo prompts', {
                photoPromptIds: snapshots.map(({ id }) => id),
                error,
            });
            throw error;
        }
    }

    override findById(
        coupleId: string,
        photoPromptId: string,
    ): Promise<PhotoPrompt | null> {
        return this.load({ photoPromptId }, async (photoPrompts) => {
            const row = await photoPrompts.findFirst({
                where: { coupleId, id: photoPromptId },
            });
            return row === null ? null : toPhotoPrompt(row);
        });
    }

    override findOfDay(
        coupleIds: ReadonlyArray<string>,
        day: string,
    ): Promise<ReadonlyArray<PhotoPrompt>> {
        return this.load({ day }, async (photoPrompts) => {
            const rows = await photoPrompts.findMany({
                where: {
                    coupleId: { in: [...coupleIds] },
                    day: toDayColumn(day),
                },
                orderBy: { id: 'asc' },
            });
            return rows.map(toPhotoPrompt);
        });
    }

    private async load<T>(
        logContext: Record<string, string>,
        read: (photoPrompts: PhotoPrompts) => Promise<T>,
    ): Promise<T> {
        try {
            return await read(this.prismaService.current.photoPrompt);
        } catch (error) {
            if (error instanceof MessagingException) throw error;
            this.logger.error('Failed to load photo prompts', {
                ...logContext,
                error,
            });
            throw error;
        }
    }
}
