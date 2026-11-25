// R17, R18: the smart tree a place belongs to: the subject and the fields of its smart folder, the name of that folder,
// and whether the place is one of its sub-folders, which keep its card template.
export type NoteCardContext = {
    readonly subject: string;
    readonly fields: readonly string[];
    readonly holderName: string;
    readonly isInherited: boolean;
};
