// R17: the fields of a card template as a sheet edits them: removed one by one, added from a small field.
export type CardTemplateEditor = {
    readonly fields: readonly string[];
    readonly error: string | null;
    readonly newField: string;
    readonly onNewFieldChange: (value: string) => void;
    readonly onAddField: () => void;
    readonly onRemoveField: (index: number) => void;
};
