// R19 to R23: where the card of a note stands. PENDING waits for the search, CHOOSING for a candidate,
// FILLED and FAILED tell its outcome, LIMIT_REACHED says the daily limit stopped it (try again tomorrow).
export const NoteCardStatusEnum = {
    PENDING: 'PENDING',
    CHOOSING: 'CHOOSING',
    FILLED: 'FILLED',
    FAILED: 'FAILED',
    LIMIT_REACHED: 'LIMIT_REACHED',
} as const;

export type NoteCardStatus =
    (typeof NoteCardStatusEnum)[keyof typeof NoteCardStatusEnum];
