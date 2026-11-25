// Shared by the domain, the contract and the note form (contracts.md rule 11, decision 0039).
export const NOTE_TITLE_MAX_LENGTH = 120;

// R13 of notes: the name of a folder (decision 0052).
export const FOLDER_NAME_MAX_LENGTH = 60;

// R17 of notes: the subject of a smart folder, one sentence, and its card template of 1 to 10 named fields.
export const FOLDER_SUBJECT_MAX_LENGTH = 280;
export const CARD_TEMPLATE_MAX_FIELDS = 10;
export const CARD_FIELD_NAME_MAX_LENGTH = 40;

// R19 of notes: at most three candidates when the typed name is ambiguous; what the partner types to refine.
export const CARD_CANDIDATE_MAX_COUNT = 3;
export const NOTE_CARD_QUERY_MAX_LENGTH = 200;
// R21, R22 of notes: the links a card keeps, and the value a partner corrects by hand.
export const NOTE_CARD_SOURCE_MAX_COUNT = 10;
export const CARD_FIELD_VALUE_MAX_LENGTH = 300;
