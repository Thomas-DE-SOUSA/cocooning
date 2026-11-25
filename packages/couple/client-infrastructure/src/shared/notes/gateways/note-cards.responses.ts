import { parseResponse } from '@cocooning/client-infrastructure/shared/http';
import {
    type NoteCardResponse,
    NoteCardResponseSchema,
    type NoteDetailResponse,
    NoteDetailResponseSchema,
} from '@cocooning/couple-contract/notes';
import type { ResponseParser } from './note-folders.responses';

// Each answer of the card routes, checked by its contract.
export const asNoteDetail: ResponseParser<NoteDetailResponse> = (r, c) =>
    parseResponse(r, NoteDetailResponseSchema, c);
export const asNoteCard: ResponseParser<NoteCardResponse> = (r, c) =>
    parseResponse(r, NoteCardResponseSchema, c);
