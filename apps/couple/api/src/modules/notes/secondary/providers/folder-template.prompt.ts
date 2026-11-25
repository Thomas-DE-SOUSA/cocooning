import {
    CARD_FIELD_NAME_MAX_LENGTH,
    CARD_TEMPLATE_MAX_FIELDS,
    FOLDER_SUBJECT_MAX_LENGTH,
} from '@cocooning/couple-shared-kernel/limits';
import type { FolderTemplateRequest } from '@cocooning/couple-server-business-logic/notes';
import { z } from 'zod';
import type { GeminiPrompt } from './gemini-interactions.client';

const SYSTEM_INSTRUCTION = [
    'You design the card template of a folder in the shared notes of a French couple.',
    'You receive the name of a new folder and the names of the folders above it.',
    `Write "subject": one sentence in French, at most ${FOLDER_SUBJECT_MAX_LENGTH} characters, saying what the folder collects.`,
    `Write "fields": 3 to ${CARD_TEMPLATE_MAX_FIELDS} distinct field names in French, at most ${CARD_FIELD_NAME_MAX_LENGTH} characters each,`,
    'for the facts worth keeping about each item of the folder, facts that can be found on the web',
    '(for restaurants: Adresse, Cuisine, Prix, Horaires).',
    'Answer with the JSON object only.',
].join(' ');

const RESPONSE_SCHEMA = {
    type: 'object',
    properties: {
        subject: { type: 'string' },
        fields: { type: 'array', items: { type: 'string' } },
    },
    required: ['subject', 'fields'],
};

// The domain checks the proposal again (R17): this only refuses what could never pass.
export const FolderTemplateAnswerSchema = z.object({
    subject: z.string().trim().min(1).max(FOLDER_SUBJECT_MAX_LENGTH),
    fields: z
        .array(z.string().trim().min(1).max(CARD_FIELD_NAME_MAX_LENGTH))
        .min(1)
        .max(CARD_TEMPLATE_MAX_FIELDS),
});

// R24: the names of the new folder and of those above it, nothing else.
export const folderTemplatePrompt = (
    request: FolderTemplateRequest,
): GeminiPrompt => ({
    operation: 'proposeTemplate',
    systemInstruction: SYSTEM_INSTRUCTION,
    input: JSON.stringify({
        folderName: request.folderName,
        parentFolderNames: request.parentFolderNames,
    }),
    responseSchema: RESPONSE_SCHEMA,
});
