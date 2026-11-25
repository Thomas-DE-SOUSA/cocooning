import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteException } from '../exceptions/note.exception';
import { type CardContext, cardContextOf } from '../models/card-context';
import type { Note } from '../models/note.aggregate';
import type { FolderRepository } from '../ports/folder.repository';

const folderIdOf = (note: Note): string | null =>
    note.folderId === null ? null : note.folderId.getValue();

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

    // R20, R25: the smart tree of the folder holding a note, or null outside one.
    findCardContextOf(note: Note): Promise<CardContext | null> {
        return this.findCardContext(note.coupleId, folderIdOf(note));
    }

    // R20, R25: the smart tree of the folder holding a note.
    loadCardContextOf(note: Note): Promise<CardContext> {
        return this.loadCardContext(note.coupleId, folderIdOf(note));
    }
}
