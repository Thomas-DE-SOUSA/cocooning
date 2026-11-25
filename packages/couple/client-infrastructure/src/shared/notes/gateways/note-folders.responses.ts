import {
    type HttpRequestConfig,
    parseResponse,
} from '@cocooning/client-infrastructure/shared/http';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import {
    type FolderResponse,
    FolderResponseSchema,
    type FolderTemplateProposalResponse,
    FolderTemplateProposalResponseSchema,
    type NoteResponse,
    NoteResponseSchema,
    type NoteSpaceContentsResponse,
    NoteSpaceContentsResponseSchema,
    type NoteSpacesResponse,
    NoteSpacesResponseSchema,
} from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';

export type ResponseParser<T> = (
    result: Result<unknown, ApiError>,
    config: HttpRequestConfig<ApiError>,
) => Result<T, ApiError>;

// Each answer of the folder routes, checked by its contract.
export const asNoteSpaces: ResponseParser<NoteSpacesResponse> = (r, c) =>
    parseResponse(r, NoteSpacesResponseSchema, c);
export const asSpaceContents: ResponseParser<NoteSpaceContentsResponse> = (
    r,
    c,
) => parseResponse(r, NoteSpaceContentsResponseSchema, c);
export const asFolder: ResponseParser<FolderResponse> = (r, c) =>
    parseResponse(r, FolderResponseSchema, c);
export const asNote: ResponseParser<NoteResponse> = (r, c) =>
    parseResponse(r, NoteResponseSchema, c);
export const asTemplateProposal: ResponseParser<
    FolderTemplateProposalResponse
> = (r, c) => parseResponse(r, FolderTemplateProposalResponseSchema, c);
