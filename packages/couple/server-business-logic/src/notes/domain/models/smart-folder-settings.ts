import { CardTemplate } from '../value-objects/card-template.vo';
import { FolderSubject } from '../value-objects/folder-subject.vo';

// R17: what the folder at the top of a smart tree stores; its sub-folders read it from there (R18).
export type SmartFolderSettings = {
    readonly subject: FolderSubject;
    readonly template: CardTemplate;
};

// R17: what a partner typed, or what the AI proposed, validated.
export const createSmartFolderSettings = (
    subject: string,
    fieldNames: ReadonlyArray<string>,
): SmartFolderSettings => ({
    subject: FolderSubject.create(subject),
    template: CardTemplate.create(fieldNames),
});

// Nothing typed is no settings; one half without the other is refused by the half that is missing.
export const smartFolderSettingsOf = (
    subject: string | null,
    fieldNames: ReadonlyArray<string> | null,
): SmartFolderSettings | null => {
    if (subject === null && fieldNames === null) return null;
    return createSmartFolderSettings(subject ?? '', fieldNames ?? []);
};

type SmartFolderSettingsColumns = {
    readonly subject: string | null;
    readonly cardTemplate: ReadonlyArray<string> | null;
};

// fromSnapshot never validates (domain.md rule 5): a stored half without the other loads as no settings.
export const smartFolderSettingsFrom = ({
    subject,
    cardTemplate,
}: SmartFolderSettingsColumns): SmartFolderSettings | null =>
    subject === null || cardTemplate === null
        ? null
        : {
              subject: FolderSubject.from(subject),
              template: CardTemplate.from(cardTemplate),
          };

export const smartFolderSettingsSnapshotOf = (
    settings: SmartFolderSettings | null,
): SmartFolderSettingsColumns => ({
    subject: settings === null ? null : settings.subject.value,
    cardTemplate: settings === null ? null : [...settings.template.fieldNames],
});
