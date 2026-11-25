import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import { createSmartFolderSettings } from '../../domain/models/smart-folder-settings';
import type { FolderRepository } from '../../domain/ports/folder.repository';
import type { CardContextService } from '../../domain/services/card-context.service';
import type { FolderPreconditionService } from '../../domain/services/folder-precondition.service';
import { type FolderView, toFolderView } from '../mappers/folder-view.mapper';

export type EditFolderTemplateCommand = {
    readonly folderId: string;
    readonly subject: string;
    readonly cardTemplate: ReadonlyArray<string>;
};

// R17, R18: from any folder of a smart tree, both partners in « Partagé » (R14) correct the subject and the
// template held at the top of the tree; its sub-folders read them from there.
export class EditFolderTemplateUseCase {
    constructor(
        private readonly folderRepository: FolderRepository,
        private readonly folderPreconditionService: FolderPreconditionService,
        private readonly cardContextService: CardContextService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: EditFolderTemplateCommand,
    ): Promise<FolderView> {
        const settings = createSmartFolderSettings(
            command.subject,
            command.cardTemplate,
        );
        await this.folderPreconditionService.loadVisibleFolder(
            context,
            command.folderId,
        );
        const { holder } = await this.cardContextService.loadCardContext(
            context.coupleId,
            command.folderId,
        );
        holder.editTemplate(
            context.userId,
            settings,
            this.dateTimeProvider.now(),
        );
        await this.folderRepository.save(holder);
        await this.eventPublishingService.publishAndClear([holder]);
        return toFolderView(holder);
    }
}
