import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { FakeLoggerAdapter } from '@cocooning/shared-kernel/testing';
import { z } from 'zod';
import {
    type FetchFunction,
    GEMINI_INTERACTIONS_URL,
    GeminiInteractionsClient,
    type GeminiPrompt,
} from './gemini-interactions.client';

const PROMPT: GeminiPrompt = {
    operation: 'proposeTemplate',
    systemInstruction: 'Answer in JSON.',
    input: '{"folderName":"Restaurants"}',
    responseSchema: { type: 'object' },
};
const AnswerSchema = z.object({ subject: z.string() });

type SentRequest = { readonly url: string; readonly init: RequestInit };

const interactionAnswering = (text: string) => ({
    id: 'interaction-1',
    status: 'completed',
    steps: [
        { type: 'user_input', content: [{ type: 'text', text: 'ignored' }] },
        { type: 'model_output', content: [{ type: 'text', text }] },
    ],
});

// A hand-written fetch (decision 0001): records each request and answers what the test chose.
const fakeFetch = (answer: () => Response) => {
    const sent: SentRequest[] = [];
    const fetchFunction: FetchFunction = (url, init) => {
        sent.push({ url: url as string, init: init ?? {} });
        return Promise.resolve(answer());
    };
    return { sent, fetchFunction };
};

const jsonResponse = (status: number, body: unknown): Response =>
    new Response(JSON.stringify(body), { status });

describe('Feature: one call to the Gemini Interactions API (decision 0054)', () => {
    let logger: FakeLoggerAdapter;

    beforeEach(() => {
        logger = new FakeLoggerAdapter();
    });

    const clientWith = (fetchFunction: FetchFunction, apiKey = 'test-key') =>
        new GeminiInteractionsClient(
            { apiKey, model: 'gemini-test' },
            logger,
            fetchFunction,
        );

    describe('Scenario: the model answers the JSON asked for', () => {
        it('returns it, after a request without tool and not stored', async () => {
            const fetch = fakeFetch(() =>
                jsonResponse(200, interactionAnswering('{"subject":"Restos"}')),
            );
            await expect(
                clientWith(fetch.fetchFunction).answer(PROMPT, AnswerSchema),
            ).resolves.toEqual({ subject: 'Restos' });
            expect(fetch.sent).toHaveLength(1);
            const [request] = fetch.sent;
            expect(request?.url).toBe(GEMINI_INTERACTIONS_URL);
            expect(request?.init.method).toBe('POST');
            expect(request?.init.headers).toEqual({
                'content-type': 'application/json',
                'x-goog-api-key': 'test-key',
            });
            expect(JSON.parse(request?.init.body as string)).toEqual({
                model: 'gemini-test',
                system_instruction: 'Answer in JSON.',
                input: '{"folderName":"Restaurants"}',
                response_format: {
                    type: 'text',
                    mime_type: 'application/json',
                    schema: { type: 'object' },
                },
                store: false,
            });
            expect(logger.entries).toEqual([]);
        });
    });

    describe('Scenario: the AI cannot be reached or answers wrong', () => {
        const unavailable = {
            code: NoteExceptionCodeEnum.NOTE_CARD_WRITER_UNAVAILABLE,
        };

        it('refuses without calling when no key is set', async () => {
            const fetch = fakeFetch(() => jsonResponse(200, {}));
            await expect(
                clientWith(fetch.fetchFunction, '').answer(
                    PROMPT,
                    AnswerSchema,
                ),
            ).rejects.toMatchObject(unavailable);
            expect(fetch.sent).toEqual([]);
            expect(logger.entries).toEqual([
                {
                    level: 'warn',
                    message: 'Gemini API key missing',
                    context: { operation: 'proposeTemplate' },
                },
            ]);
        });

        it('logs the status of a refused request, never its body', async () => {
            const fetch = fakeFetch(() =>
                jsonResponse(429, { error: { message: 'quota of test-key' } }),
            );
            await expect(
                clientWith(fetch.fetchFunction).answer(PROMPT, AnswerSchema),
            ).rejects.toMatchObject(unavailable);
            expect(logger.entries).toEqual([
                {
                    level: 'warn',
                    message: 'Gemini request refused',
                    context: { operation: 'proposeTemplate', statusCode: 429 },
                },
            ]);
        });

        it('logs the kind of a network failure', async () => {
            const failing: FetchFunction = () =>
                Promise.reject(new TypeError('fetch failed'));
            await expect(
                clientWith(failing).answer(PROMPT, AnswerSchema),
            ).rejects.toMatchObject(unavailable);
            expect(logger.entries[0]?.context).toEqual({
                operation: 'proposeTemplate',
                errorName: 'TypeError',
            });
        });

        it.each([
            ['text that is not JSON', interactionAnswering('Voici : Restos')],
            ['JSON of another shape', interactionAnswering('{"subject":42}')],
            ['an interaction without answer', { steps: [] }],
            ['an empty answer', interactionAnswering('')],
            ['a body that is no interaction', { outputs: 'none' }],
        ])('refuses %s, without logging it', async (_label, body) => {
            const fetch = fakeFetch(() => jsonResponse(200, body));
            await expect(
                clientWith(fetch.fetchFunction).answer(PROMPT, AnswerSchema),
            ).rejects.toMatchObject(unavailable);
            expect(logger.entries).toEqual([
                {
                    level: 'warn',
                    message: 'Gemini answer refused',
                    context: { operation: 'proposeTemplate' },
                },
            ]);
        });
    });

    describe('Scenario: an answer in several parts', () => {
        it('joins the text parts of the model and skips the others', async () => {
            const fetch = fakeFetch(() =>
                jsonResponse(200, {
                    steps: [
                        {
                            type: 'model_output',
                            content: [
                                { type: 'text', text: '{"subject":' },
                                { type: 'thought' },
                                { type: 'text', text: '"Restos"}' },
                            ],
                        },
                        { type: 'model_output' },
                    ],
                }),
            );
            await expect(
                clientWith(fetch.fetchFunction).answer(PROMPT, AnswerSchema),
            ).resolves.toEqual({ subject: 'Restos' });
        });
    });
});
