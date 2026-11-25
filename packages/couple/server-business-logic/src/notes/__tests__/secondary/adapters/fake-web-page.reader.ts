import type { WebPageText } from '../../../domain/models/note-card-writing';
import { WebPageReader } from '../../../domain/ports/web-page.reader';

// Gives the text of a page when the test set one, leaves the others out, as the reader does with a page it cannot read.
export class FakeWebPageReader extends WebPageReader {
    private texts: ReadonlyMap<string, string> = new Map();
    private reads: ReadonlyArray<ReadonlyArray<string>> = [];

    get requestedUrls(): ReadonlyArray<ReadonlyArray<string>> {
        return this.reads;
    }

    givenPage(url: string, text: string): void {
        this.texts = new Map([...this.texts, [url, text]]);
    }

    override read(
        urls: ReadonlyArray<string>,
    ): Promise<ReadonlyArray<WebPageText>> {
        this.reads = [...this.reads, urls];
        return Promise.resolve(
            urls.flatMap((url) => {
                const text = this.texts.get(url);
                return text === undefined ? [] : [{ url, text }];
            }),
        );
    }
}
