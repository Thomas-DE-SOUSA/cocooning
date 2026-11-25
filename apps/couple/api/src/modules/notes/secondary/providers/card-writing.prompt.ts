import {
    CARD_CANDIDATE_MAX_COUNT,
    CARD_FIELD_VALUE_MAX_LENGTH,
} from '@cocooning/couple-shared-kernel/limits';
import type { NoteCardWritingRequest } from '@cocooning/couple-server-business-logic/notes';
import { z } from 'zod';
import type { GeminiPrompt } from './gemini-interactions.client';

const CANDIDATE_LABEL_MAX_LENGTH = 120;
const CANDIDATE_DETAIL_MAX_LENGTH = 200;

const SYSTEM_INSTRUCTION = [
    'You fill the card of one item in the shared notes of a French couple.',
    'You receive the subject of the folder, the names of the folders above the item, the fields of the card,',
    'what the couple typed, and the results and page texts of a web search.',
    'Use only these texts. Never use your own knowledge, never guess, never invent a value or an address.',
    'If several distinct places or things clearly match what was typed, answer "kind": "CANDIDATES" with',
    `2 to ${CARD_CANDIDATE_MAX_COUNT} candidates (a short "label" and a "detail" telling them apart, such as the city), and empty values.`,
    'Otherwise answer "kind": "VALUES" with one entry per field: its exact "field" name and its "value" in French,',
    `at most ${CARD_FIELD_VALUE_MAX_LENGTH} characters, or null when the texts do not give it; and in "sourceUrls"`,
    'the addresses of the results or pages you actually used. Answer with the JSON object only.',
].join(' ');

const RESPONSE_SCHEMA = {
    type: 'object',
    properties: {
        kind: { type: 'string', enum: ['CANDIDATES', 'VALUES'] },
        candidates: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    label: { type: 'string' },
                    detail: { type: 'string' },
                },
                required: ['label', 'detail'],
            },
        },
        values: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    field: { type: 'string' },
                    value: { type: ['string', 'null'] },
                },
                required: ['field', 'value'],
            },
        },
        sourceUrls: { type: 'array', items: { type: 'string' } },
    },
    required: ['kind', 'candidates', 'values', 'sourceUrls'],
};

// Checked here, never trusted as it comes (core.md rule 28); the domain bounds it again.
export const CardWritingAnswerSchema = z.discriminatedUnion('kind', [
    z.object({
        kind: z.literal('CANDIDATES'),
        candidates: z
            .array(
                z.object({
                    label: z
                        .string()
                        .trim()
                        .min(1)
                        .max(CANDIDATE_LABEL_MAX_LENGTH),
                    detail: z.string().trim().max(CANDIDATE_DETAIL_MAX_LENGTH),
                }),
            )
            .min(2),
    }),
    z.object({
        kind: z.literal('VALUES'),
        values: z.array(
            z.object({
                field: z.string(),
                value: z
                    .string()
                    .trim()
                    .max(CARD_FIELD_VALUE_MAX_LENGTH)
                    .nullable()
                    .transform((value) => (value === '' ? null : value)),
            }),
        ),
        sourceUrls: z.array(z.string()),
    }),
]);

export type CardWritingAnswer = z.infer<typeof CardWritingAnswerSchema>;

// R24: the subject, the folders, the fields, what was typed and the texts found; nothing of the couple's notes.
export const cardWritingPrompt = (
    request: NoteCardWritingRequest,
): GeminiPrompt => ({
    operation: 'writeCard',
    systemInstruction: SYSTEM_INSTRUCTION,
    input: JSON.stringify({
        subject: request.subject,
        folderNames: request.folderNames,
        fields: request.fieldNames,
        typed: request.query,
        searchResults: request.results,
        pages: request.pages,
    }),
    responseSchema: RESPONSE_SCHEMA,
});
