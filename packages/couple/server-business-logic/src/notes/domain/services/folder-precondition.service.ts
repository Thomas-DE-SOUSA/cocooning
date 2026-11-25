import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { NoteException } from '../exceptions/note.exception';
import type { Folder } from '../models/folder.aggregate';
import type { FolderRepository } from '../ports/folder.repository';
import { FolderPlacementValidator } from './folder-placement.validator';

export class FolderPreconditionService {
    constructor(private readonly folderRepository: FolderRepository) {}

    // R14: unknown, deleted or in the other partner's « Privé », the answer is the same.
    async loadVisibleFolder(
        context: ExecutionContext,
        folderId: string,
    ): Promise<Folder> {
        const folder = await this.folderRepository.findVisibleById(
            context.coupleId,
            context.userId,
            folderId,
        );
        if (folder !== null) return folder;
        throw new NoteException({
            code: NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
            message: 'Folder not found',
        });
    }

    // A visible folder, or the root of a space (null).
    async loadVisibleFolderOrRoot(
        context: ExecutionContext,
        folderId: string | null,
    ): Promise<Folder | null> {
        if (folderId === null) return null;
        return this.loadVisibleFolder(context, folderId);
    }

    // The place a note or a folder goes to, or is read from: a visible folder of that space, or its root.
    async loadDestination(
        context: ExecutionContext,
        space: NoteSpace,
        folderId: string | null,
    ): Promise<Folder | null> {
        const folder = await this.loadVisibleFolderOrRoot(context, folderId);
        FolderPlacementValidator.ensureInSpace(folder, space);
        return folder;
    }
}
