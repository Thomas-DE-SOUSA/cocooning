import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type {
    DateTimeProvider,
    UnitOfWork,
} from '@cocooning/shared-kernel/ports';
import type { FolderRepository } from '../../domain/ports/folder.repository';
import type { FolderPreconditionService } from '../../domain/services/folder-precondition.service';

export type DeleteFolderCommand = {
    readonly folderId: string;
};

// R14, R16: whoever sees the folder deletes it; its notes and sub-folders move up, in the same transaction.
export class DeleteFolderUseCase {
    constructor(
        private readonly folderRepository: FolderRepository,
        private readonly folderPreconditionService: FolderPreconditionService,
        private readonly unitOfWork: UnitOfWork,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: DeleteFolderCommand,
    ): Promise<void> {
        const folder = await this.folderPreconditionService.loadVisibleFolder(
            context,
            command.folderId,
        );
        folder.delete(context.userId, this.dateTimeProvider.now());
        await this.unitOfWork.run(async () => {
            await this.folderRepository.save(folder);
            await this.folderRepository.moveContentUp(folder);
        });
        await this.eventPublishingService.publishAndClear([folder]);
    }
}
