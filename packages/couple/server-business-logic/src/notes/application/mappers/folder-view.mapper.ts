import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import type { Folder } from '../../domain/models/folder.aggregate';

export type FolderView = {
    readonly folderId: string;
    readonly space: NoteSpace;
    readonly parentFolderId: string | null;
    readonly name: string;
    readonly updatedAt: Date;
};

export const toFolderView = (folder: Folder): FolderView => ({
    folderId: folder.id.getValue(),
    space: folder.space,
    parentFolderId:
        folder.parentFolderId === null
            ? null
            : folder.parentFolderId.getValue(),
    name: folder.name.value,
    updatedAt: folder.updatedAt,
});
