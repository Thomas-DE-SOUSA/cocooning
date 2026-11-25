import { Injectable } from '@nestjs/common';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    NoteException,
    type WebSearchResult,
    WebSearchProvider,
} from '@cocooning/couple-server-business-logic/notes';
import { Logger } from '@cocooning/shared-kernel/ports';
import { z } from 'zod';
import type { FetchFunction } from './gemini-interactions.client';

// The first results only: the AI reads their snippets, the reader the first pages (decision 0054).
export const WEB_SEARCH_RESULT_COUNT = 8;
const SEARCH_LANGUAGE = 'fr';

export type SearxngSettings = {
    readonly baseUrl: string;
    readonly timeoutMs: number;
};

const SearxngAnswerSchema = z.object({
    results: z.array(
        z.object({
            title: z.string(),
            url: z.url({ protocol: /^https?$/ }),
            content: z.string().optional(),
        }),
    ),
});

const unavailable = (): NoteException =>
    new NoteException({
        code: NoteExceptionCodeEnum.NOTE_CARD_SEARCH_UNAVAILABLE,
        message: 'The search engine did not answer',
    });

// SearXNG on the internal network of the VM, in JSON (decision 0054). The query is never logged (core.md rule 33).
@Injectable()
export class SearxngWebSearchProvider extends WebSearchProvider {
    constructor(
        private readonly settings: SearxngSettings,
        private readonly logger: Logger,
        private readonly fetchFunction: FetchFunction = fetch,
    ) {
        super();
    }

    override async search(
        query: string,
    ): Promise<ReadonlyArray<WebSearchResult>> {
        const parsed = SearxngAnswerSchema.safeParse(
            await this.fetchAnswer(query),
        );
        if (!parsed.success) {
            this.logger.warn('SearXNG answer refused', {});
            throw unavailable();
        }
        return parsed.data.results
            .slice(0, WEB_SEARCH_RESULT_COUNT)
            .map(({ title, url, content }) => ({
                title,
                url,
                snippet: content ?? '',
            }));
    }

    private async fetchAnswer(query: string): Promise<unknown> {
        const url = new URL('/search', this.settings.baseUrl);
        url.search = new URLSearchParams({
            q: query,
            format: 'json',
            language: SEARCH_LANGUAGE,
        }).toString();
        try {
            const response = await this.fetchFunction(url, {
                headers: { accept: 'application/json' },
                signal: AbortSignal.timeout(this.settings.timeoutMs),
            });
            if (response.ok) return await response.json();
            this.logger.warn('SearXNG request refused', {
                statusCode: response.status,
            });
        } catch (error) {
            this.logger.warn('SearXNG request failed', {
                errorName: error instanceof Error ? error.name : 'unknown',
            });
        }
        throw unavailable();
    }
}
