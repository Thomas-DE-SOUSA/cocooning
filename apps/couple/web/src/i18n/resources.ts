import type { Locale } from './config';
import frSignIn from './locales/fr/authentication/sign-in.json';
import frGeneric from './locales/fr/generic.json';
import frPairingCouple from './locales/fr/pairing/couple.json';

export const RESOURCES = {
    fr: {
        'generic': frGeneric,
        'authentication/sign-in': frSignIn,
        'pairing/couple': frPairingCouple,
    },
} as const satisfies Record<Locale, Record<string, object>>;

export type Namespace = keyof (typeof RESOURCES)['fr'];
