import { resolveRoute } from '@cocooning/client-infrastructure/shared/http';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';

export type NoteCardsEndpoints = {
    readonly folderCards: (folderId: string) => string;
    readonly chooseCandidate: (noteId: string) => string;
    readonly refine: (noteId: string) => string;
    readonly refresh: (noteId: string) => string;
    readonly fields: (noteId: string) => string;
};

export function resolveNoteCardsEndpoints(
    apiBaseUrl: string,
): NoteCardsEndpoints {
    const ofNote = (path: string) => (noteId: string) =>
        resolveRoute(apiBaseUrl, path, { noteId });
    return {
        folderCards: (folderId) =>
            resolveRoute(apiBaseUrl, ApiRouterEnum.NOTE_CARD_ADD, { folderId }),
        chooseCandidate: ofNote(ApiRouterEnum.NOTE_CARD_CANDIDATE_CHOOSE),
        refine: ofNote(ApiRouterEnum.NOTE_CARD_REFINE),
        refresh: ofNote(ApiRouterEnum.NOTE_CARD_REFRESH),
        fields: ofNote(ApiRouterEnum.NOTE_CARD_FIELD_CORRECT),
    };
}
