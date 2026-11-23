export const I18N_CONFIG = {
    defaultLocale: 'fr',
    supportedLocales: ['fr'],
    defaultNamespace: 'generic',
} as const;

export type Locale = (typeof I18N_CONFIG.supportedLocales)[number];
