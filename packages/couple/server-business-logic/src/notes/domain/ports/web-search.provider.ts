import type { WebSearchResult } from '../models/note-card-writing';

// Our search engine on the VM (decision 0054): what the couple typed and the names of the folders, nothing else (R24).
// A failure throws NOTE_CARD_SEARCH_UNAVAILABLE; no result is an empty list.
export abstract class WebSearchProvider {
    abstract search(query: string): Promise<ReadonlyArray<WebSearchResult>>;
}
