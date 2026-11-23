import type { Locale } from './config';
import frSignIn from './locales/fr/authentication/sign-in.json';
import frSignOut from './locales/fr/authentication/sign-out.json';
import frGeneric from './locales/fr/generic.json';
import frNotesList from './locales/fr/notes/list.json';
import frPairingCouple from './locales/fr/pairing/couple.json';

export const RESOURCES = {
    fr: {
        'generic': frGeneric,
        'authentication/sign-in': frSignIn,
        'authentication/sign-out': frSignOut,
        'pairing/couple': frPairingCouple,
        'notes/list': frNotesList,
    },
} as const satisfies Record<Locale, Record<string, object>>;

export type Namespace = keyof (typeof RESOURCES)['fr'];
