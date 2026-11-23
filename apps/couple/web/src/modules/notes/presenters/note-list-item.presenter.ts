import { resolveRoute } from '@cocooning/client-infrastructure/shared/http';
import type { NoteResponse } from '@cocooning/couple-contract/notes';
import { NoteVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { I18N_CONFIG } from '@/i18n/config';
import type { NoteListItem } from '../view-models/notes-screen.view-model';

const UPDATED_AT_FORMAT = new Intl.DateTimeFormat(I18N_CONFIG.defaultLocale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: I18N_CONFIG.timeZone,
});

const SAME_ORIGIN = '';

// A note as both screens show it: its page, its visibility and its last change in Paris time.
export const toNoteListItem = (note: NoteResponse): NoteListItem => ({
    noteId: note.noteId,
    href: resolveRoute(SAME_ORIGIN, WebRouterEnum.NOTE_EDITOR, {
        noteId: note.noteId,
    }),
    title: note.title,
    isShared: note.visibility === NoteVisibilityEnum.SHARED,
    isOwner: note.isOwner,
    updatedAt: UPDATED_AT_FORMAT.format(new Date(note.updatedAt)),
});
