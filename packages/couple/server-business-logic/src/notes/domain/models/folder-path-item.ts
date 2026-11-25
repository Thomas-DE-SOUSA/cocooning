// One step of the way from the root of a space to a folder: the breadcrumb, and the ancestors a move checks (R15).
export type FolderPathItem = {
    readonly folderId: string;
    readonly name: string;
};
