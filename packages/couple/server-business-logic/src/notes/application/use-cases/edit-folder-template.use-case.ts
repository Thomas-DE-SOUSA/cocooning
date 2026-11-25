import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type {
    DateTimeProvider,
    UnitOfWork,
} from '@cocooning/shared-kernel/ports';
import { createSmartFolderSettings } from '../../domain/models/smart-folder-settings';
import type { FolderRepository } from '../../domain/ports/folder.repository';
import type { NoteCardRepository } from '../../domain/ports/note-card.repository';
import { applyEditedTemplate } from '../../domain/services/card-template-propagation';
import type { CardContextService } from '../../domain/services/card-context.service';
import type { FolderPreconditionService } from '../../domain/services/folder-precondition.service';
import { type FolderView, toFolderView } from '../mappers/folder-view.mapper';

export type EditFolderTemplateCommand = {
    readonly folderId: string;
    readonly subject: string;
    readonly cardTemplate: ReadonlyArray<string>;
};

// R17, R18: from any folder of a smart tree, both partners in « Partagé » (R14) correct the subject and the
// template held at the top of the tree; its sub-folders read them from there. R22: the cards of the tree follow,
// and a filled card that gains a field searches again, within the daily limit.
export class EditFolderTemplateUseCase {
    constructor(
        private readonly folderRepository: FolderRepository,
        private readonly noteCardRepository: NoteCardRepository,
        private readonly folderPreconditionService: FolderPreconditionService,
        private readonly cardContextService: CardContextService,
        private readonly unitOfWork: UnitOfWork,
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
        const cards = await this.noteCardRepository.findInTree(
            context.coupleId,
            holder.id.getValue(),
        );
        const now = this.dateTimeProvider.now();
        holder.editTemplate(context.userId, settings, now);
        applyEditedTemplate(cards, context.userId, settings.template, now);
        await this.unitOfWork.run(async () => {
            await this.folderRepository.save(holder);
            await this.noteCardRepository.saveAll(cards);
        });
        await this.eventPublishingService.publishAndClear([holder, ...cards]);
        return toFolderView(holder);
    }
}
