import type { Namespace } from '@/i18n/resources';
import { NOTES_SCREEN_ERROR_CODES } from './notes-i18n-namespaces';

export const NOTE_LISTS_NAMESPACE = 'notes/lists' satisfies Namespace;

// Decision 0037: the screens of the Lists tab receive the codes of the notes, those of the lists among them.
export const NOTE_LISTS_SCREEN_ERROR_CODES = NOTES_SCREEN_ERROR_CODES;
