import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteException } from '../exceptions/note.exception';
import { type CardContext, cardContextOf } from '../models/card-context';
import type { FolderRepository } from '../ports/folder.repository';

export class CardContextService {
    constructor(private readonly folderRepository: FolderRepository) {}

    // R18: the smart tree of a folder, in one query; null for a space root or outside a smart tree.
    async findCardContext(
        coupleId: string,
        folderId: string | null,
    ): Promise<CardContext | null> {
        return cardContextOf(
            await this.folderRepository.findLineage(coupleId, folderId),
        );
    }

    // R19, R22, R25: what only a smart folder allows.
    async loadCardContext(
        coupleId: string,
        folderId: string | null,
    ): Promise<CardContext> {
        const context = await this.findCardContext(coupleId, folderId);
        if (context !== null) return context;
        throw new NoteException({
            code: NoteExceptionCodeEnum.FOLDER_NOT_SMART,
            message: 'Not in a smart folder',
        });
    }
}
