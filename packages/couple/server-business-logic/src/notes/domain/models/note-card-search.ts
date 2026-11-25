import type { CardContext } from './card-context';
import { fieldsToSearch } from './card-fields';
import type { NoteCard } from './note-card.aggregate';
import type {
    NoteCardFindings,
    NoteCardWritingRequest,
    WebSearchResult,
} from './note-card-writing';

// Decision 0054: the text of the first three pages found is read.
export const NOTE_CARD_PAGES_READ = 3;

// R19, R24: what the couple typed and the names of the folders from the smart one down; never the subject sentence.
// The same words go to the search engine and to OpenStreetMap (decision 0055).
export const searchQueryOf = (card: NoteCard, context: CardContext): string =>
    [card.query.value, ...context.folderNames].join(' ');

export const pagesToRead = (
    results: ReadonlyArray<WebSearchResult>,
): ReadonlyArray<string> =>
    results.slice(0, NOTE_CARD_PAGES_READ).map((result) => result.url);

// R22, R24: the fields still to find, and what leaves for the AI, nothing else.
export const noteCardWritingRequestOf = (
    card: NoteCard,
    context: CardContext,
    findings: NoteCardFindings,
): NoteCardWritingRequest => ({
    subject: context.settings.subject.value,
    folderNames: context.folderNames,
    fieldNames: fieldsToSearch(card.fields),
    query: card.query.value,
    ...findings,
});
