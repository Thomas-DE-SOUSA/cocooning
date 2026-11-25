import type { Locale } from './config';
import frAgendaCalendar from './locales/fr/agenda/calendar.json';
import frSignIn from './locales/fr/authentication/sign-in.json';
import frSignOut from './locales/fr/authentication/sign-out.json';
import frGeneric from './locales/fr/generic.json';
import frMessagingMessages from './locales/fr/messaging/messages.json';
import frMessagingPush from './locales/fr/messaging/push.json';
import frNotesCard from './locales/fr/notes/card.json';
import frNotesList from './locales/fr/notes/list.json';
import frNotesNote from './locales/fr/notes/note.json';
import frNotesSpace from './locales/fr/notes/space.json';
import frPairingCouple from './locales/fr/pairing/couple.json';

export const RESOURCES = {
    fr: {
        'generic': frGeneric,
        'authentication/sign-in': frSignIn,
        'authentication/sign-out': frSignOut,
        'pairing/couple': frPairingCouple,
        'notes/list': frNotesList,
        'notes/note': frNotesNote,
        'notes/space': frNotesSpace,
        'notes/card': frNotesCard,
        'agenda/calendar': frAgendaCalendar,
        'messaging/messages': frMessagingMessages,
        'messaging/push': frMessagingPush,
    },
} as const satisfies Record<Locale, Record<string, object>>;

export type Namespace = keyof (typeof RESOURCES)['fr'];
