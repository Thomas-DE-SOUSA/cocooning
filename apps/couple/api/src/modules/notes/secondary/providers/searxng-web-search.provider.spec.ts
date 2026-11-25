import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { FakeLoggerAdapter } from '@cocooning/shared-kernel/testing';
import type { FetchFunction } from './gemini-interactions.client';
import {
    SearxngWebSearchProvider,
    WEB_SEARCH_RESULT_COUNT,
} from './searxng-web-search.provider';

const result = (index: number) => ({
    title: `Chez Paul ${index}`,
    url: `https://example.org/${index}`,
    content: `Bouchon ${index}`,
});

describe('Feature: the search through SearXNG (decision 0054)', () => {
    let logger: FakeLoggerAdapter;
    let asked: string[];

    beforeEach(() => {
        logger = new FakeLoggerAdapter();
        asked = [];
    });

    const providerAnswering = (answer: () => Response) => {
        const fetchFunction: FetchFunction = (url) => {
            asked.push((url as URL).toString());
            return Promise.resolve(answer());
        };
        return new SearxngWebSearchProvider(
            { baseUrl: 'http://searxng:8080', timeoutMs: 1000 },
            logger,
            fetchFunction,
        );
    };
    const json = (status: number, body: unknown) => () =>
        new Response(JSON.stringify(body), { status });

    it('asks in JSON and in French, and keeps the first results', async () => {
        const provider = providerAnswering(
            json(200, {
                results: [
                    ...Array.from({ length: 10 }, (_, index) => result(index)),
                ],
            }),
        );
        const results = await provider.search('Chez Paul Restaurants Lyon');
        expect(asked).toEqual([
            'http://searxng:8080/search?q=Chez+Paul+Restaurants+Lyon&format=json&language=fr',
        ]);
        expect(results).toHaveLength(WEB_SEARCH_RESULT_COUNT);
        expect(results[0]).toEqual({
            title: 'Chez Paul 0',
            url: 'https://example.org/0',
            snippet: 'Bouchon 0',
        });
    });

    it('gives an empty snippet to a result without content', async () => {
        const provider = providerAnswering(
            json(200, {
                results: [{ title: 'T', url: 'https://example.org' }],
            }),
        );
        await expect(provider.search('T')).resolves.toEqual([
            { title: 'T', url: 'https://example.org', snippet: '' },
        ]);
    });

    describe('Scenario: the engine fails', () => {
        const unavailable = {
            code: NoteExceptionCodeEnum.NOTE_CARD_SEARCH_UNAVAILABLE,
        };

        it('logs the status of a refusal, never the query', async () => {
            await expect(
                providerAnswering(json(429, {})).search('Chez Paul'),
            ).rejects.toMatchObject(unavailable);
            expect(logger.entries).toEqual([
                {
                    level: 'warn',
                    message: 'SearXNG request refused',
                    context: { statusCode: 429 },
                },
            ]);
        });

        it('refuses an answer of another shape', async () => {
            await expect(
                providerAnswering(json(200, { results: 'none' })).search('T'),
            ).rejects.toMatchObject(unavailable);
            expect(logger.entries[0]?.message).toBe('SearXNG answer refused');
        });

        it('logs the kind of a network failure', async () => {
            const failing = new SearxngWebSearchProvider(
                { baseUrl: 'http://searxng:8080', timeoutMs: 1000 },
                logger,
                () => Promise.reject(new TypeError('fetch failed')),
            );
            await expect(failing.search('T')).rejects.toMatchObject(
                unavailable,
            );
            expect(logger.entries[0]?.context).toEqual({
                errorName: 'TypeError',
            });
        });
    });
});
