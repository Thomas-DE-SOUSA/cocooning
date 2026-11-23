'use client';

import { createInstance } from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { buildI18nOptions } from './i18n-options';

const clientI18n = createInstance().use(initReactI18next);
// Bundled resources with initAsync false: init finishes synchronously, its promise carries nothing to wait for.
void clientI18n.init(buildI18nOptions());

export function I18nProvider({ children }: { readonly children: ReactNode }) {
    return <I18nextProvider i18n={clientI18n}>{children}</I18nextProvider>;
}
