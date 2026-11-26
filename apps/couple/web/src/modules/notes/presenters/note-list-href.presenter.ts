import { resolveRoute } from '@cocooning/client-infrastructure/shared/http';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { NoteListsSection } from '../view-models/note-lists-screen.view-model';

const SAME_ORIGIN = '';

// /lists?section=: a section of the Lists tab; /lists/:noteId: one of its lists (decision 0058).
export const noteListsSectionHref = (section: NoteListsSection): string =>
    `${WebRouterEnum.NOTE_LISTS}?${new URLSearchParams({ section }).toString()}`;

export const noteListHref = (noteId: string): string =>
    resolveRoute(SAME_ORIGIN, WebRouterEnum.NOTE_LIST, { noteId });
