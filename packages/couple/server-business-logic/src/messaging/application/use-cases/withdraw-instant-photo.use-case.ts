import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type {
    DateTimeProvider,
    FileStorage,
} from '@cocooning/shared-kernel/ports';
import type { InstantPhotoRepository } from '../../domain/ports/instant-photo.repository';
import type { InstantPhotoPreconditionService } from '../../domain/services/instant-photo-precondition.service';

export type WithdrawInstantPhotoCommand = {
    readonly instantPhotoId: string;
};

export class WithdrawInstantPhotoUseCase {
    constructor(
        private readonly instantPhotoRepository: InstantPhotoRepository,
        private readonly instantPhotoPreconditionService: InstantPhotoPreconditionService,
        private readonly fileStorage: FileStorage,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    // R6: the row is withdrawn first, then its file deleted; a failed deletion leaves an unread file, never a listed photo without bytes.
    async execute(
        context: ExecutionContext,
        command: WithdrawInstantPhotoCommand,
    ): Promise<void> {
        const instantPhoto =
            await this.instantPhotoPreconditionService.loadInstantPhoto(
                context,
                command.instantPhotoId,
            );
        instantPhoto.withdraw(context.userId, this.dateTimeProvider.now());
        await this.instantPhotoRepository.save(instantPhoto);
        await this.fileStorage.delete(instantPhoto.fileKey);
        await this.eventPublishingService.publishAndClear([instantPhoto]);
    }
}
