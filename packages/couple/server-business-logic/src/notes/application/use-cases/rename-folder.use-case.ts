import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { FolderRepository } from '../../domain/ports/folder.repository';
import type { FolderPreconditionService } from '../../domain/services/folder-precondition.service';
import { FolderName } from '../../domain/value-objects/folder-name.vo';
import { type FolderView, toFolderView } from '../mappers/folder-view.mapper';

export type RenameFolderCommand = {
    readonly folderId: string;
    readonly name: string;
};

// R13, R14: whoever sees the folder renames it.
export class RenameFolderUseCase {
    constructor(
        private readonly folderRepository: FolderRepository,
        private readonly folderPreconditionService: FolderPreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: RenameFolderCommand,
    ): Promise<FolderView> {
        const name = FolderName.create(command.name);
        const folder = await this.folderPreconditionService.loadVisibleFolder(
            context,
            command.folderId,
        );
        folder.rename(context.userId, name, this.dateTimeProvider.now());
        await this.folderRepository.save(folder);
        await this.eventPublishingService.publishAndClear([folder]);
        return toFolderView(folder);
    }
}
