import { lintFixture, runEslint } from './lint-fixture';

describe('domain boundaries (real boundaries.js on a fake repository)', () => {
    const { status, messagesOf } = lintFixture('forbidden-import');

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
