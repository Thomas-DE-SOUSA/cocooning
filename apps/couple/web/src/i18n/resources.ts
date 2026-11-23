import type { Locale } from './config';
import frSignIn from './locales/fr/authentication/sign-in.json';
import frGeneric from './locales/fr/generic.json';

export const RESOURCES = {
    fr: { 'generic': frGeneric, 'authentication/sign-in': frSignIn },
} as const satisfies Record<Locale, Record<string, object>>;

export type Namespace = keyof (typeof RESOURCES)['fr'];
