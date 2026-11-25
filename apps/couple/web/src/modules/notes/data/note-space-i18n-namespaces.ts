import type { Namespace } from '@/i18n/resources';
import { NOTES_SCREEN_ERROR_CODES } from './notes-i18n-namespaces';

export const NOTE_SPACE_NAMESPACE = 'notes/space' satisfies Namespace;

// Decision 0037: the screen of a space and its sheets receive the contract codes of the notes and of their folders.
export const NOTE_SPACE_SCREEN_ERROR_CODES = NOTES_SCREEN_ERROR_CODES;
