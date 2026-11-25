// R19: a card in doubt, with the candidates the couple chooses from.
export type CardCandidate = {
    readonly label: string;
    readonly detail: string;
};

export type NoteCardChoice = {
    readonly noteId: string;
    readonly title: string;
    readonly candidates: readonly CardCandidate[];
};
