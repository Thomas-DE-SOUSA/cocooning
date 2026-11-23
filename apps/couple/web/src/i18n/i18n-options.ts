import type { InitOptions } from 'i18next';
import { I18N_CONFIG } from './config';
import { RESOURCES } from './resources';

export function buildI18nOptions(): InitOptions {
    return {
        lng: I18N_CONFIG.defaultLocale,
        fallbackLng: I18N_CONFIG.defaultLocale,
        supportedLngs: I18N_CONFIG.supportedLocales,
        defaultNS: I18N_CONFIG.defaultNamespace,
        ns: Object.keys(RESOURCES[I18N_CONFIG.defaultLocale]),
        resources: RESOURCES,
        initAsync: false,
        interpolation: { escapeValue: false },
    };
}
