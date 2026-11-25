import type { FolderName } from '../value-objects/folder-name.vo';
import type { FolderPathItem } from './folder-path-item';

// R17, R24: what leaves for the AI to propose a template: the name of the new folder and the names above it.
export type FolderTemplateRequest = {
    readonly folderName: string;
    readonly parentFolderNames: ReadonlyArray<string>;
};

export type FolderTemplateProposal = {
    readonly subject: string;
    readonly fieldNames: ReadonlyArray<string>;
};

export const folderTemplateRequestOf = (
    name: FolderName,
    parentPath: ReadonlyArray<FolderPathItem>,
): FolderTemplateRequest => ({
    folderName: name.value,
    parentFolderNames: parentPath.map((step) => step.name),
});
