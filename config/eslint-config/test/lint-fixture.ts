import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

export type LintMessage = { ruleId: string | null; message: string };
type LintResult = { filePath: string; messages: LintMessage[] };

export const packageRoot = path.resolve(__dirname, '..');
const eslintBin = path.join(
    path.dirname(createRequire(__filename).resolve('eslint/package.json')),
    'bin',
    'eslint.js',
);

export const runEslint = (...args: string[]) =>
    spawnSync(process.execPath, [eslintBin, ...args], {
        cwd: packageRoot,
        encoding: 'utf8',
    });

/** Lints `__fixtures__/<name>/` with its own `fixture.eslint.config.mjs`. */
export const lintFixture = (name: string) => {
    const fixtureRoot = path.join(packageRoot, '__fixtures__', name);
    const run = runEslint(
        '--config',
        path.join(fixtureRoot, 'fixture.eslint.config.mjs'),
        '--format',
        'json',
        fixtureRoot,
    );
    const results = JSON.parse(run.stdout) as LintResult[];
    const byFile = new Map(
        results.map((result) => [
            path.relative(fixtureRoot, result.filePath),
            result.messages,
        ]),
    );
    const messagesOf = (file: string): LintMessage[] => {
        const messages = byFile.get(file);
        if (!messages) {
            throw new Error(`ESLint did not lint ${file}`);
        }
        return messages;
    };
    return { status: run.status, messagesOf };
};
