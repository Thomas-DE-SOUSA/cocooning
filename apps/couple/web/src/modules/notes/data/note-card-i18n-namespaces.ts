import type { Namespace } from '@/i18n/resources';
import { NOTES_SCREEN_ERROR_CODES } from './notes-i18n-namespaces';

export const NOTE_CARD_NAMESPACE = 'notes/card' satisfies Namespace;

// Decision 0037: the cards of a smart folder and of a note receive the contract codes of the notes, their folders and
// their cards; a 503 of the AI or of the search arrives as UNKNOWN with its backend code.
export const NOTE_CARD_SCREEN_ERROR_CODES = NOTES_SCREEN_ERROR_CODES;
