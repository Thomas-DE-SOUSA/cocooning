import type { SmartFolderSettings } from '../../domain/models/smart-folder-settings';

export type FolderTemplateProposalView = {
    readonly subject: string;
    readonly cardTemplate: ReadonlyArray<string>;
};

export const toFolderTemplateProposalView = (
    settings: SmartFolderSettings,
): FolderTemplateProposalView => ({
    subject: settings.subject.value,
    cardTemplate: settings.template.fieldNames,
});
