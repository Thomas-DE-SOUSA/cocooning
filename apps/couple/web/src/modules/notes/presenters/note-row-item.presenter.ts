import type {
    NoteCardResponse,
    NoteDetailResponse,
} from '@cocooning/couple-contract/notes';
import type {
    NoteCardLine,
    NoteRowItem,
} from '../view-models/note-card-line.view-model';
import { toNoteListItem } from './note-list-item.presenter';

const SUMMARY_VALUE_COUNT = 2;
const SUMMARY_SEPARATOR = ' · ';

// R21: the first values found, « Bistrot · 25 à 35 € »; a field « non trouvé » is skipped.
const presentNoteCardLine = (card: NoteCardResponse): NoteCardLine => {
    const values = card.fields
        .map((field) => field.value)
        .filter((value) => value !== null)
        .slice(0, SUMMARY_VALUE_COUNT);
    return {
        status: card.status,
        summary: values.length === 0 ? null : values.join(SUMMARY_SEPARATOR),
    };
};

// A note of a place with the line of its card (R20).
export const toNoteRowItem = (note: NoteDetailResponse): NoteRowItem => ({
    ...toNoteListItem(note),
    card: note.card === null ? null : presentNoteCardLine(note.card),
});
