import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteException } from '../../../domain/exceptions/note.exception';
import type { WebSearchResult } from '../../../domain/models/note-card-writing';
import { WebSearchProvider } from '../../../domain/ports/web-search.provider';

// Records each query (R24) and answers the results the test chose, or the unavailable engine.
export class FakeWebSearchProvider extends WebSearchProvider {
    private results: ReadonlyArray<WebSearchResult> | null = [];
    private sent: ReadonlyArray<string> = [];

    get queries(): ReadonlyArray<string> {
        return this.sent;
    }

    willFind(results: ReadonlyArray<WebSearchResult>): void {
        this.results = results;
    }

    willBeUnavailable(): void {
        this.results = null;
    }

    override search(query: string): Promise<ReadonlyArray<WebSearchResult>> {
        this.sent = [...this.sent, query];
        if (this.results !== null) return Promise.resolve(this.results);
        return Promise.reject(
            new NoteException({
                code: NoteExceptionCodeEnum.NOTE_CARD_SEARCH_UNAVAILABLE,
                message: 'Fake search engine unavailable',
            }),
        );
    }
}
