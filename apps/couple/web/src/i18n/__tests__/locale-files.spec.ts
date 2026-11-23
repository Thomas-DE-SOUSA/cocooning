import { I18N_CONFIG } from '../config';
import { RESOURCES } from '../resources';
import { flattenLocale } from './flatten-locale';

const SINGLE_BRACE_PLACEHOLDER = /(?<!\{)\{\s*[\w.]+\s*\}(?!\})/;

const namespacesOf = (locale: keyof typeof RESOURCES) =>
    Object.entries(RESOURCES[locale]);

describe('Feature: locale files', () => {
    describe('Scenario: interpolation', () => {
        it.each(I18N_CONFIG.supportedLocales)(
            'uses {{double braces}} only in %s',
            (locale) => {
                const offenders = namespacesOf(locale)
                    .flatMap(([, messages]) => flattenLocale(messages))
                    .filter(({ text }) => SINGLE_BRACE_PLACEHOLDER.test(text));

                expect(offenders).toEqual([]);
            },
        );
    });

    describe('Scenario: every language has the same keys', () => {
        it.each(I18N_CONFIG.supportedLocales)(
            '%s has the keys of the default locale',
            (locale) => {
                const keysOf = (target: keyof typeof RESOURCES) =>
                    namespacesOf(target).flatMap(([namespace, messages]) =>
                        flattenLocale(messages).map(
                            ({ key }) => `${namespace}:${key}`,
                        ),
                    );

                expect(keysOf(locale)).toEqual(
                    keysOf(I18N_CONFIG.defaultLocale),
                );
            },
        );
    });
});
