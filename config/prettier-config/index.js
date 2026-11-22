/**
 * The single Prettier configuration of the monorepo: 4 spaces everywhere,
 * single quotes. No package overrides it.
 *
 * @type {import("prettier").Config}
 */
export default {
    singleQuote: true,
    trailingComma: 'all',
    bracketSpacing: true,
    semi: true,
    printWidth: 80,
    tabWidth: 4,
    useTabs: false,
    arrowParens: 'always',
    endOfLine: 'lf',
    jsxSingleQuote: false,
    quoteProps: 'consistent',
    embeddedLanguageFormatting: 'auto',
    singleAttributePerLine: true,
};
