import { Injectable } from '@nestjs/common';
import {
    type WebPageText,
    WebPageReader,
} from '@cocooning/couple-server-business-logic/notes';
import { Logger } from '@cocooning/shared-kernel/ports';
import type { FetchFunction } from './gemini-interactions.client';
import { htmlToText } from './html-to-text';

// Enough for the facts of a card, small enough for the free AI (decision 0054).
export const WEB_PAGE_TEXT_MAX_LENGTH = 20_000;
const READABLE_TYPES = /^(text\/html|text\/plain|application\/xhtml\+xml)/i;
const WEB_URL = /^https?:\/\//i;

// Reads the pages in parallel (core.md rule 9), each bounded by WEB_SEARCH_TIMEOUT_MS; a page that fails is left
// out and counted, never logged by its address (core.md rule 33).
@Injectable()
export class FetchWebPageReader extends WebPageReader {
    constructor(
        private readonly timeoutMs: number,
        private readonly logger: Logger,
        private readonly fetchFunction: FetchFunction = fetch,
    ) {
        super();
    }

    override async read(
        urls: ReadonlyArray<string>,
    ): Promise<ReadonlyArray<WebPageText>> {
        const pages = await Promise.all(urls.map((url) => this.readOne(url)));
        const read = pages.flatMap((page) => (page === null ? [] : [page]));
        if (read.length < urls.length) {
            this.logger.debug('Some pages could not be read', {
                asked: urls.length,
                read: read.length,
            });
        }
        return read;
    }

    private async readOne(url: string): Promise<WebPageText | null> {
        if (!WEB_URL.test(url)) return null;
        try {
            const response = await this.fetchFunction(url, {
                headers: { accept: 'text/html,text/plain' },
                redirect: 'follow',
                signal: AbortSignal.timeout(this.timeoutMs),
            });
            const type = response.headers.get('content-type') ?? '';
            if (!response.ok || !READABLE_TYPES.test(type)) return null;
            const text = htmlToText(await response.text());
            return { url, text: text.slice(0, WEB_PAGE_TEXT_MAX_LENGTH) };
        } catch {
            // A page that times out or refuses is one source less, counted by read(); nothing to do here.
            return null;
        }
    }
}
