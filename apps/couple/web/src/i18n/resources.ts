import type { Locale } from './config';
import frAgendaCalendar from './locales/fr/agenda/calendar.json';
import frSignIn from './locales/fr/authentication/sign-in.json';
import frSignOut from './locales/fr/authentication/sign-out.json';
import frGeneric from './locales/fr/generic.json';
import frNotesList from './locales/fr/notes/list.json';
import frNotesNote from './locales/fr/notes/note.json';
import frPairingCouple from './locales/fr/pairing/couple.json';

export const RESOURCES = {
    fr: {
        'generic': frGeneric,
        'authentication/sign-in': frSignIn,
        'authentication/sign-out': frSignOut,
        'pairing/couple': frPairingCouple,
        'notes/list': frNotesList,
        'notes/note': frNotesNote,
        'agenda/calendar': frAgendaCalendar,
    },
} as const satisfies Record<Locale, Record<string, object>>;

export type Namespace = keyof (typeof RESOURCES)['fr'];
