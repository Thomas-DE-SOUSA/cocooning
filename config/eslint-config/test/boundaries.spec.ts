import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

type LintMessage = { ruleId: string | null; message: string };
type LintResult = { filePath: string; messages: LintMessage[] };

const packageRoot = path.resolve(__dirname, '..');
const fixtureRoot = path.join(packageRoot, '__fixtures__', 'forbidden-import');
const eslintBin = path.join(
    path.dirname(createRequire(__filename).resolve('eslint/package.json')),
    'bin',
    'eslint.js',
);

const runEslint = (...args: string[]) =>
    spawnSync(process.execPath, [eslintBin, ...args], {
        cwd: packageRoot,
        encoding: 'utf8',
    });

const lintFixture = () => {
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
    return { status: run.status, byFile };
};

describe('domain boundaries (real boundaries.js on a fake repository)', () => {
    const { status, byFile } = lintFixture();

    const messagesOf = (file: string): LintMessage[] => {
        const messages = byFile.get(file);
        if (!messages) {
            throw new Error(`ESLint did not lint ${file}`);
        }
        return messages;
    };

    it('fails the lint when a fixture breaks a boundary', () => {
        expect(status).toBe(1);
    });

    it.each([
        [
            'packages/couple/server-business-logic/src/forbidden-nest-import.ts',
            'boundaries/dependencies',
            'must not import @nestjs/*',
        ],
        [
            'packages/couple/server-business-logic/src/forbidden-prisma-import.ts',
            'boundaries/dependencies',
            'must not import @nestjs/*, @prisma/*',
        ],
        [
            'packages/couple/server-business-logic/src/forbidden-domain-import.ts',
            'boundaries/dependencies',
            'must not import from another domain',
        ],
        [
            'packages/couple/contract/src/forbidden-business-logic-import.ts',
            'boundaries/dependencies',
            'must not import server-business-logic',
        ],
        [
            'packages/shared-kernel/src/forbidden-domain-import.ts',
            'boundaries/dependencies',
            'must not import from a domain',
        ],
        [
            'packages/design-system/src/forbidden-next-import.ts',
            'boundaries/dependencies',
            'must not import Next.js',
        ],
        [
            'packages/client-infrastructure/src/shared/forbidden-react-import.ts',
            'boundaries/dependencies',
            'is framework-agnostic',
        ],
        [
            'packages/couple/server-business-logic/src/forbidden-enum.ts',
            'no-restricted-syntax',
            'TypeScript enums are forbidden',
        ],
    ])('rejects %s', (file, ruleId, message) => {
        expect(messagesOf(file)).toEqual([
            expect.objectContaining({
                ruleId,
                message: expect.stringContaining(message),
            }),
        ]);
    });

    it('accepts a framework-free import in server-business-logic', () => {
        expect(
            messagesOf(
                'packages/couple/server-business-logic/src/allowed-import.ts',
            ),
        ).toEqual([]);
    });

    it('keeps the fixtures out of the normal lint of this package', () => {
        const run = runEslint('--max-warnings=0', '.');
        expect(run.stderr).toBe('');
        expect(run.status).toBe(0);
    });
});
