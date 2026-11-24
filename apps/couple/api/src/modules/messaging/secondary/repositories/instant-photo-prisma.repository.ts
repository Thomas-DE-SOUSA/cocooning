import { Injectable } from '@nestjs/common';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    InstantPhoto,
    InstantPhotoRepository,
    MessagingException,
} from '@cocooning/couple-server-business-logic/messaging';
import { Logger, UnitOfWork } from '@cocooning/shared-kernel/ports';
import { type InstantPhotoRow, toInstantPhotoSnapshot } from '../mappers';
import { writeInstantPhoto } from './instant-photo-prisma.writer';
import { toPhotoPromptAlreadyAnswered } from './instant-photo-unique-constraints';
import { appendMessagingEvents } from './messaging-event-prisma.writer';
import {
    instantPhotoVersionConflict,
    toInstantPhotoVersionConflict,
} from './messaging-version-conflict';
import { newestOf } from './newest-messages.query';

type InstantPhotos = PrismaService['current']['instantPhoto'];

const toInstantPhoto = (row: InstantPhotoRow): InstantPhoto =>
    InstantPhoto.fromSnapshot(toInstantPhotoSnapshot(row));

// Withdrawn rows are filtered by the soft-delete extension; coupleId leads every where (core-backend.md rule 12).
@Injectable()
export class InstantPhotoPrismaRepository extends InstantPhotoRepository {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly unitOfWork: UnitOfWork,
        private readonly logger: Logger,
    ) {
        super();
        this.logger.setContext(InstantPhotoPrismaRepository.name);
    }

    override async save(instantPhoto: InstantPhoto): Promise<void> {
        const snapshot = instantPhoto.toSnapshot();
        const events = instantPhoto.getDomainEvents();
        try {
            await this.unitOfWork.run(async () => {
                const tx = this.prismaService.current;
                await writeInstantPhoto(
                    tx,
                    snapshot,
                    instantPhotoVersionConflict,
                );
                await appendMessagingEvents(tx, events);
            });
        } catch (error) {
            if (error instanceof MessagingException) throw error;
            const conflict =
                toPhotoPromptAlreadyAnswered(error) ??
                toInstantPhotoVersionConflict(error);
            if (conflict !== null) throw conflict;
            this.logger.error('Failed to save instant photo', {
                instantPhotoId: snapshot.id,
                error,
            });
            throw error;
        }
    }

    override findById(
        coupleId: string,
        instantPhotoId: string,
    ): Promise<InstantPhoto | null> {
        return this.load({ instantPhotoId }, async (instantPhotos) => {
            const row = await instantPhotos.findFirst({
                where: { coupleId, id: instantPhotoId },
            });
            return row === null ? null : toInstantPhoto(row);
        });
    }

    override findNewest(
        coupleId: string,
        before: string | null,
        count: number,
    ): Promise<ReadonlyArray<InstantPhoto>> {
        return this.load({ coupleId }, async (instantPhotos) => {
            const rows = await instantPhotos.findMany(
                newestOf(coupleId, before, count),
            );
            return rows.map(toInstantPhoto);
        });
    }

    override findOfPhotoPrompts(
        coupleId: string,
        photoPromptIds: ReadonlyArray<string>,
    ): Promise<ReadonlyArray<InstantPhoto>> {
        return this.load({ coupleId }, async (instantPhotos) => {
            const rows = await instantPhotos.findMany({
                where: { coupleId, photoPromptId: { in: [...photoPromptIds] } },
                orderBy: { id: 'asc' },
            });
            return rows.map(toInstantPhoto);
        });
    }

    // Logged by identifiers only: the photo belongs to the couple (core.md rule 33).
    private async load<T>(
        logContext: Record<string, string>,
        read: (instantPhotos: InstantPhotos) => Promise<T>,
    ): Promise<T> {
        try {
            return await read(this.prismaService.current.instantPhoto);
        } catch (error) {
            if (error instanceof MessagingException) throw error;
            this.logger.error('Failed to load instant photos', {
                ...logContext,
                error,
            });
            throw error;
        }
    }
}
