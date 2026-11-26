import { parseResponse } from '@cocooning/client-infrastructure/shared/http';
import {
    type NoteListIndexResponse,
    NoteListIndexResponseSchema,
    type NoteListResponse,
    NoteListResponseSchema,
} from '@cocooning/couple-contract/notes';
import type { ResponseParser } from './note-folders.responses';

// Each answer of the list routes, checked by its contract.
export const asNoteListIndex: ResponseParser<NoteListIndexResponse> = (r, c) =>
    parseResponse(r, NoteListIndexResponseSchema, c);
export const asNoteList: ResponseParser<NoteListResponse> = (r, c) =>
    parseResponse(r, NoteListResponseSchema, c);
