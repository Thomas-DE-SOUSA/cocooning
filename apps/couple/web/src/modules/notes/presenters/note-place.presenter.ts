import { resolveRoute } from '@cocooning/client-infrastructure/shared/http';
import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type {
    FolderRef,
    NotePlace,
} from '../view-models/note-place.view-model';

const SAME_ORIGIN = '';

// The root of a space at /spaces/:space, one of its folders with ?folderId=.
export function presentNotePlace(
    space: NoteSpace,
    folder: FolderRef | null,
): NotePlace {
    const root = resolveRoute(SAME_ORIGIN, WebRouterEnum.NOTE_SPACE, { space });
    if (folder === null) return { space, folder, href: root };
    const query = new URLSearchParams({ folderId: folder.folderId });
    return { space, folder, href: `${root}?${query.toString()}` };
}

// path runs from the root of the space to the folder opened (empty at the root); back is null above the root.
export function presentPathPlaces(
    space: NoteSpace,
    path: readonly FolderRef[],
): { readonly place: NotePlace; readonly back: NotePlace | null } {
    const opened = path.at(-1);
    const root = presentNotePlace(space, null);
    if (opened === undefined) return { place: root, back: null };
    const parent = path.at(-2);
    return {
        place: presentNotePlace(space, opened),
        back: parent === undefined ? root : presentNotePlace(space, parent),
    };
}
