export const I18N_CONFIG = {
    defaultLocale: 'fr',
    supportedLocales: ['fr'],
    defaultNamespace: 'generic',
    // The couple lives in France: dates render in this zone on the server and on the phone alike (no hydration gap).
    timeZone: 'Europe/Paris',
} as const;

export type Locale = (typeof I18N_CONFIG.supportedLocales)[number];
