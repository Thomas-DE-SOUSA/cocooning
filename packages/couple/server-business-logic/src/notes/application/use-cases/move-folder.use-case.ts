import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { FolderRepository } from '../../domain/ports/folder.repository';
import type { FolderPreconditionService } from '../../domain/services/folder-precondition.service';
import { type FolderView, toFolderView } from '../mappers/folder-view.mapper';

export type MoveFolderCommand = {
    readonly folderId: string;
    readonly parentFolderId: string | null;
};

// R14, R15: into another folder of the same space or its root, never into itself nor one of its sub-folders.
export class MoveFolderUseCase {
    constructor(
        private readonly folderRepository: FolderRepository,
        private readonly folderPreconditionService: FolderPreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: MoveFolderCommand,
    ): Promise<FolderView> {
        const folder = await this.folderPreconditionService.loadVisibleFolder(
            context,
            command.folderId,
        );
        const parent =
            await this.folderPreconditionService.loadVisibleFolderOrRoot(
                context,
                command.parentFolderId,
            );
        const parentPath = await this.folderRepository.findPath(
            context.coupleId,
            command.parentFolderId,
        );
        folder.moveTo(
            context.userId,
            parent,
            parentPath,
            this.dateTimeProvider.now(),
        );
        await this.folderRepository.save(folder);
        await this.eventPublishingService.publishAndClear([folder]);
        return toFolderView(folder);
    }
}
