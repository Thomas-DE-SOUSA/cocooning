import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    NoteException,
    type WebPageText,
    WebPageReader,
    type WebSearchResult,
    WebSearchProvider,
} from '@cocooning/couple-server-business-logic/notes';

// The E2E tests never reach SearXNG nor a web page: queries are recorded, results chosen by the spec.
export class FakeWebSearchProvider extends WebSearchProvider {
    private results: ReadonlyArray<WebSearchResult> | null = [];
    private sent: ReadonlyArray<string> = [];

    get queries(): ReadonlyArray<string> {
        return this.sent;
    }

    reset(): void {
        this.results = [];
        this.sent = [];
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
                message: 'The search engine did not answer',
            }),
        );
    }
}

export class FakeWebPageReader extends WebPageReader {
    private texts: ReadonlyMap<string, string> = new Map();

    reset(): void {
        this.texts = new Map();
    }

    givenPage(url: string, text: string): void {
        this.texts = new Map([...this.texts, [url, text]]);
    }

    override read(
        urls: ReadonlyArray<string>,
    ): Promise<ReadonlyArray<WebPageText>> {
        return Promise.resolve(
            urls.flatMap((url) => {
                const text = this.texts.get(url);
                return text === undefined ? [] : [{ url, text }];
            }),
        );
    }
}
