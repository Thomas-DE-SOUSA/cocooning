import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Decision 0004: every class of `domain/events/` declares its
 * `static readonly EVENT_NAME = '...' as const`, and no other file retypes one
 * of these names as a string. Runs first in the root `pnpm lint`.
 *
 * Usage: node scripts/check-event-names.mjs [repositoryRoot]
 */

const SCANNED_ROOTS = ['packages', 'apps'];
const SKIPPED_FOLDERS = new Set([
    'node_modules',
    'dist',
    'generated',
    'coverage',
    '.turbo',
]);
const EVENT_FILE = /\/domain\/events\/[^/]+\.event\.ts$/;
const SOURCE_FILE = /\.tsx?$/;
const EVENT_NAME_DECLARATION =
    /static\s+readonly\s+EVENT_NAME\s*=\s*(['"`])([^'"`]+)\1\s+as\s+const/;

const lineOf = (source, index) => source.slice(0, index).split('\n').length;

const declareEventName = (file) => {
    if (!/\bclass\s+\w+/.test(file.source)) {
        return { violation: `${file.path}: no event class in domain/events/` };
    }
    const match = EVENT_NAME_DECLARATION.exec(file.source);
    if (!match) {
        return {
            violation: `${file.path}: missing static readonly EVENT_NAME = '<context>.<object>.<fact>' as const`,
        };
    }
    return { eventName: { name: match[2], path: file.path } };
};

const retypedNames = (file, eventNames) =>
    eventNames
        .filter((eventName) => eventName.path !== file.path)
        .flatMap(({ name, path: owner }) => {
            const quoted = new RegExp(
                `(['"\`])${name.replaceAll('.', '\\.')}\\1`,
                'g',
            );
            return [...file.source.matchAll(quoted)].map(
                (match) =>
                    `${file.path}:${lineOf(file.source, match.index)}: '${name}' is retyped; reference the EVENT_NAME of ${owner}`,
            );
        });

/**
 * @param {ReadonlyArray<{ path: string, source: string }>} files the `.ts`
 *   and `.tsx` files to check, with paths relative to the repository root.
 * @returns {string[]} one message per violation, empty when the rule holds.
 */
export function findEventNameViolations(files) {
    const declarations = files
        .filter((file) => EVENT_FILE.test(`/${file.path}`))
        .map(declareEventName);
    const eventNames = declarations.flatMap((d) =>
        d.eventName ? [d.eventName] : [],
    );
    return [
        ...declarations.flatMap((d) => (d.violation ? [d.violation] : [])),
        ...files.flatMap((file) => retypedNames(file, eventNames)),
    ];
}

const listSourceFiles = (root, folder) =>
    readdirSync(path.join(root, folder), { withFileTypes: true }).flatMap(
        (entry) => {
            const relative = path.posix.join(folder, entry.name);
            if (entry.isDirectory()) {
                return SKIPPED_FOLDERS.has(entry.name)
                    ? []
                    : listSourceFiles(root, relative);
            }
            return SOURCE_FILE.test(entry.name) ? [relative] : [];
        },
    );

const readSourceFiles = (root) =>
    SCANNED_ROOTS.filter((folder) => existsSync(path.join(root, folder)))
        .flatMap((folder) => listSourceFiles(root, folder))
        .map((file) => ({
            path: file,
            source: readFileSync(path.join(root, file), 'utf8'),
        }));

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const root = path.resolve(
        process.argv[2] ?? path.join(import.meta.dirname, '..'),
    );
    const violations = findEventNameViolations(readSourceFiles(root));
    if (violations.length > 0) {
        console.error(`Event names (decision 0004):\n${violations.join('\n')}`);
        process.exit(1);
    }
}
