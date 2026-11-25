import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteException } from '@cocooning/couple-server-business-logic/notes';
import type { Logger } from '@cocooning/shared-kernel/ports';
import type { z } from 'zod';
import { answerOf } from './gemini-interaction';

export const GEMINI_INTERACTIONS_URL =
    'https://generativelanguage.googleapis.com/v1beta/interactions';
// A card is written in the background (decision 0054); a proposal waits for it on the phone: long, but bounded.
export const GEMINI_REQUEST_TIMEOUT_MS = 30_000;

export type GeminiSettings = {
    readonly apiKey: string;
    readonly model: string;
};

// What one call sends: instructions, the data as JSON text, and the JSON schema the answer must follow.
export type GeminiPrompt = {
    readonly operation: string;
    readonly systemInstruction: string;
    readonly input: string;
    readonly responseSchema: Readonly<Record<string, unknown>>;
};

export type FetchFunction = typeof fetch;

const unavailable = (): NoteException =>
    new NoteException({
        code: NoteExceptionCodeEnum.NOTE_CARD_WRITER_UNAVAILABLE,
        message: 'The AI did not answer',
    });

// One interaction per call, by fetch and without SDK, not stored by Google (store: false), no tool: never the
// Google Search tool (decision 0054). Logs say which operation failed and why, never the prompt nor the answer.
export class GeminiInteractionsClient {
    constructor(
        private readonly settings: GeminiSettings,
        private readonly logger: Logger,
        private readonly fetchFunction: FetchFunction = fetch,
    ) {}

    async answer<T>(
        prompt: GeminiPrompt,
        answerSchema: z.ZodType<T>,
    ): Promise<T> {
        if (this.settings.apiKey.length === 0) {
            this.logger.warn('Gemini API key missing', {
                operation: prompt.operation,
            });
            throw unavailable();
        }
        const body = await this.send(prompt);
        const answer = answerOf(body, answerSchema);
        if (answer !== null) return answer;
        this.logger.warn('Gemini answer refused', {
            operation: prompt.operation,
        });
        throw unavailable();
    }

    private async send(prompt: GeminiPrompt): Promise<unknown> {
        try {
            const response = await this.fetchFunction(GEMINI_INTERACTIONS_URL, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-goog-api-key': this.settings.apiKey,
                },
                body: JSON.stringify(this.requestBody(prompt)),
                signal: AbortSignal.timeout(GEMINI_REQUEST_TIMEOUT_MS),
            });
            if (response.ok) return await response.json();
            this.logger.warn('Gemini request refused', {
                operation: prompt.operation,
                statusCode: response.status,
            });
        } catch (error) {
            this.logger.warn('Gemini request failed', {
                operation: prompt.operation,
                errorName: error instanceof Error ? error.name : 'unknown',
            });
        }
        throw unavailable();
    }

    private requestBody(prompt: GeminiPrompt) {
        return {
            model: this.settings.model,
            system_instruction: prompt.systemInstruction,
            input: prompt.input,
            response_format: {
                type: 'text',
                mime_type: 'application/json',
                schema: prompt.responseSchema,
            },
            store: false,
        };
    }
}
