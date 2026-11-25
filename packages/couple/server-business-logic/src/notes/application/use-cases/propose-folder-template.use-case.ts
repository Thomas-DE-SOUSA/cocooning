import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { folderTemplateRequestOf } from '../../domain/models/folder-template-request';
import { createSmartFolderSettings } from '../../domain/models/smart-folder-settings';
import type { FolderRepository } from '../../domain/ports/folder.repository';
import type { NoteCardWriter } from '../../domain/ports/note-card.writer';
import type { FolderPreconditionService } from '../../domain/services/folder-precondition.service';
import { SmartFolderValidator } from '../../domain/services/smart-folder.validator';
import { FolderName } from '../../domain/value-objects/folder-name.vo';
import {
    type FolderTemplateProposalView,
    toFolderTemplateProposalView,
} from '../mappers/folder-template-proposal-view.mapper';

export type ProposeFolderTemplateCommand = {
    readonly space: NoteSpace;
    readonly parentFolderId: string | null;
    readonly name: string;
};

// R17: the AI proposes a subject and a card template from the name and the place; nothing is stored,
// and no web search is made, so the daily limit of R23 does not count it.
export class ProposeFolderTemplateUseCase {
    constructor(
        private readonly folderRepository: FolderRepository,
        private readonly folderPreconditionService: FolderPreconditionService,
        private readonly noteCardWriter: NoteCardWriter,
    ) {}

    async execute(
        context: ExecutionContext,
        command: ProposeFolderTemplateCommand,
    ): Promise<FolderTemplateProposalView> {
        const name = FolderName.create(command.name);
        const parent = await this.folderPreconditionService.loadDestination(
            context,
            command.space,
            command.parentFolderId,
        );
        SmartFolderValidator.ensureTemplateAllowedUnder(parent);
        const parentPath = await this.folderRepository.findPath(
            context.coupleId,
            command.parentFolderId,
        );
        const proposal = await this.noteCardWriter.proposeTemplate(
            folderTemplateRequestOf(name, parentPath),
        );
        return toFolderTemplateProposalView(
            createSmartFolderSettings(proposal.subject, proposal.fieldNames),
        );
    }
}
