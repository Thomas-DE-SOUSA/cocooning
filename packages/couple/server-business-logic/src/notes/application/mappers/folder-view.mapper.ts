import type {
    FolderKind,
    NoteSpace,
} from '@cocooning/couple-shared-kernel/enums';
import type { Folder } from '../../domain/models/folder.aggregate';
import { smartFolderSettingsSnapshotOf } from '../../domain/models/smart-folder-settings';

// subject and cardTemplate are those the folder holds: null on a classic folder and inside a smart tree (R18).
export type FolderView = {
    readonly folderId: string;
    readonly space: NoteSpace;
    readonly kind: FolderKind;
    readonly parentFolderId: string | null;
    readonly name: string;
    readonly subject: string | null;
    readonly cardTemplate: ReadonlyArray<string> | null;
    readonly updatedAt: Date;
};

export const toFolderView = (folder: Folder): FolderView => ({
    folderId: folder.id.getValue(),
    space: folder.space,
    kind: folder.kind,
    parentFolderId:
        folder.parentFolderId === null
            ? null
            : folder.parentFolderId.getValue(),
    name: folder.name.value,
    ...smartFolderSettingsSnapshotOf(folder.settings),
    updatedAt: folder.updatedAt,
});
