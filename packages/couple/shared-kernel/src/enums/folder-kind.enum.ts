// Decision 0052: a classic folder only stores; a smart folder (« dossier IA ») fills a card for what is added to it (R17).
export const FolderKindEnum = {
    CLASSIC: 'CLASSIC',
    SMART: 'SMART',
} as const;

export type FolderKind = (typeof FolderKindEnum)[keyof typeof FolderKindEnum];
