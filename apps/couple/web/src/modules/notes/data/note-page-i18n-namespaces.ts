import type { Namespace } from '@/i18n/resources';
import { NOTES_SCREEN_ERROR_CODES } from './notes-i18n-namespaces';

export const NOTE_NAMESPACE = 'notes/note' satisfies Namespace;

// Decision 0037: the page of a note receives the same contract codes as the list.
export const NOTE_SCREEN_ERROR_CODES = NOTES_SCREEN_ERROR_CODES;
