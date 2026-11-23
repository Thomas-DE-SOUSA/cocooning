import { createInstance, type TFunction } from 'i18next';
import { I18N_CONFIG } from './config';
import { buildI18nOptions } from './i18n-options';
import type { Namespace } from './resources';

export async function getServerTranslation(
    namespace: Namespace,
): Promise<TFunction> {
    const instance = createInstance();
    await instance.init(buildI18nOptions());
    return instance.getFixedT(I18N_CONFIG.defaultLocale, namespace);
}
