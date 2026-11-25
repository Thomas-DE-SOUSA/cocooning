import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import { Folder } from '../../domain/models/folder.aggregate';
import type { FolderRepository } from '../../domain/ports/folder.repository';
import type { FolderPreconditionService } from '../../domain/services/folder-precondition.service';
import { FolderName } from '../../domain/value-objects/folder-name.vo';
import { type FolderView, toFolderView } from '../mappers/folder-view.mapper';

export type CreateFolderCommand = {
    readonly space: NoteSpace;
    readonly parentFolderId: string | null;
    readonly name: string;
};

// R13, R14: in a space or in one of its folders.
export class CreateFolderUseCase {
    constructor(
        private readonly folderRepository: FolderRepository,
        private readonly folderPreconditionService: FolderPreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: CreateFolderCommand,
    ): Promise<FolderView> {
        const name = FolderName.create(command.name);
        const parent = await this.folderPreconditionService.loadDestination(
            context,
            command.space,
            command.parentFolderId,
        );
        const folder = Folder.create(
            {
                coupleId: context.coupleId,
                ownerId: context.userId,
                space: command.space,
                parent,
                name,
            },
            this.dateTimeProvider.now(),
        );
        await this.folderRepository.save(folder);
        await this.eventPublishingService.publishAndClear([folder]);
        return toFolderView(folder);
    }
}
