import type {
    FolderResponse,
    NoteSpaceContentsResponse,
} from '@cocooning/couple-contract/notes';
import type {
    FolderView,
    NoteSpaceContentsView,
} from '@cocooning/couple-server-business-logic/notes';
import { toNoteResponse } from './to-note-response.mapper';

// Dates cross the wire as ISO strings (contracts.md rule 4).
export const toFolderResponse = (view: FolderView): FolderResponse => ({
    folderId: view.folderId,
    space: view.space,
    kind: view.kind,
    parentFolderId: view.parentFolderId,
    name: view.name,
    subject: view.subject,
    cardTemplate: view.cardTemplate === null ? null : [...view.cardTemplate],
    updatedAt: view.updatedAt.toISOString(),
});

export const toNoteSpaceContentsResponse = (
    view: NoteSpaceContentsView,
): NoteSpaceContentsResponse => ({
    space: view.space,
    path: view.path.map(({ folderId, name }) => ({ folderId, name })),
    folders: view.folders.map((folder) => ({
        ...toFolderResponse(folder),
        folderCount: folder.folderCount,
        noteCount: folder.noteCount,
    })),
    notes: view.notes.map(toNoteResponse),
});
