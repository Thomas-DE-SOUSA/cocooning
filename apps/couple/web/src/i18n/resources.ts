import type { Locale } from './config';
import frGeneric from './locales/fr/generic.json';

export const RESOURCES = {
    fr: { generic: frGeneric },
} as const satisfies Record<Locale, Record<string, object>>;

export type Namespace = keyof (typeof RESOURCES)['fr'];
