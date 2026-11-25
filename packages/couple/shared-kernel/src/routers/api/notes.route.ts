import type { RouteGroup } from '../route-group';

// Create and list share one path, get, rename and delete another: the HTTP verb tells them apart.
export const NotesRouteEnum = {
    NOTE_CREATE: '/notes',
    NOTE_LIST: '/notes',
    NOTE_GET: '/notes/:noteId',
    NOTE_RENAME: '/notes/:noteId',
    NOTE_DELETE: '/notes/:noteId',
    NOTE_SHARE: '/notes/:noteId/share',
    NOTE_MAKE_PRIVATE: '/notes/:noteId/make-private',
    NOTE_MOVE: '/notes/:noteId/move',
    // WebSocket of the real-time channel (decision 0040), routed by tailscale serve to the API.
    NOTE_COLLABORATION: '/collab',
    // R10: the two spaces of the home screen, then the content of a space root or of one of its folders.
    NOTE_SPACE_LIST: '/note-spaces',
    NOTE_SPACE_CONTENTS_GET: '/note-spaces/:space/contents',
    FOLDER_CREATE: '/note-folders',
    FOLDER_RENAME: '/note-folders/:folderId',
    FOLDER_DELETE: '/note-folders/:folderId',
    FOLDER_MOVE: '/note-folders/:folderId/move',
    // R17: the subject and the card template the AI proposes for a new smart folder, then their correction.
    FOLDER_TEMPLATE_PROPOSE: '/note-folders/template-proposals',
    FOLDER_TEMPLATE_EDIT: '/note-folders/:folderId/template',
    // R19 to R22: a note added by its name to a smart folder, then the actions on its card.
    NOTE_CARD_ADD: '/note-folders/:folderId/cards',
    NOTE_CARD_CANDIDATE_CHOOSE: '/notes/:noteId/card/choose',
    NOTE_CARD_REFINE: '/notes/:noteId/card/refine',
    NOTE_CARD_REFRESH: '/notes/:noteId/card/refresh',
    NOTE_CARD_FIELD_CORRECT: '/notes/:noteId/card/fields',
} as const satisfies RouteGroup;
