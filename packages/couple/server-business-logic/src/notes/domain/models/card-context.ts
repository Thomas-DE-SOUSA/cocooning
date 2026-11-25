import { FolderKindEnum } from '@cocooning/couple-shared-kernel/enums';
import type { Folder } from './folder.aggregate';
import type { SmartFolderSettings } from './smart-folder-settings';

// R18, R24: the smart tree a folder belongs to: the folder holding the settings, and the names from it down to the folder.
export type CardContext = {
    readonly holder: Folder;
    readonly settings: SmartFolderSettings;
    readonly folderNames: ReadonlyArray<string>;
};

// Walking up from the last folder of the lineage (root first), through smart folders only, to the nearest holder.
export const cardContextOf = (
    lineage: ReadonlyArray<Folder>,
): CardContext | null => {
    const smartTail = lineage.slice(
        lineage
            .map((folder) => folder.kind)
            .lastIndexOf(FolderKindEnum.CLASSIC) + 1,
    );
    const holders = smartTail.flatMap((folder) =>
        folder.settings === null ? [] : [{ folder, settings: folder.settings }],
    );
    const nearest = holders.at(-1);
    if (nearest === undefined) return null;
    return {
        holder: nearest.folder,
        settings: nearest.settings,
        folderNames: smartTail
            .slice(smartTail.indexOf(nearest.folder))
            .map((folder) => folder.name.value),
    };
};
