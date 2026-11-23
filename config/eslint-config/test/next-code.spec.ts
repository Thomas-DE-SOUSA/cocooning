import { lintFixture } from './lint-fixture';

describe('Next.js rules (next.js on a fake Next.js app)', () => {
    const { status, messagesOf } = lintFixture('next-code');

    it('fails the lint when a fixture breaks a rule', () => {
        expect(status).toBe(1);
    });

    it('rejects process.env outside src/env', () => {
        expect(messagesOf('src/app/forbidden-process-env.ts')).toEqual([
            expect.objectContaining({
                ruleId: 'no-restricted-properties',
                message: expect.stringContaining('src/env/'),
            }),
        ]);
    });

    it('accepts process.env inside src/env', () => {
        expect(messagesOf('src/env/allowed-process-env.ts')).toEqual([]);
    });

    describe('Feature module guardrails (decisions 0009, 0010, 0011)', () => {
        it.each([
            [
                'src/modules/notes/ui/views/forbidden-hook.view.tsx',
                'no-restricted-syntax',
                'decision 0009',
            ],
            [
                'src/modules/notes/ui/views/forbidden-navigation.view.tsx',
                'no-restricted-imports',
                'useRouter',
            ],
            [
                'src/modules/notes/ui/views/forbidden-gateway.view.tsx',
                'no-restricted-imports',
                'gateway',
            ],
            [
                'src/modules/notes/hooks/forbidden-toast-message.ts',
                'no-restricted-syntax',
                'describeApiResultError',
            ],
            [
                'src/modules/notes/hooks/forbidden-cross-module.ts',
                'no-restricted-imports',
                'another module',
            ],
            [
                'src/app/forbidden-module-interior.ts',
                'no-restricted-imports',
                'entry point',
            ],
            [
                'src/app/forbidden-relative-module-interior.ts',
                'no-restricted-imports',
                'entry point',
            ],
            [
                'src/app/forbidden-toast-message.ts',
                'no-restricted-syntax',
                'describeApiResultError',
            ],
            [
                'src/shared/forbidden-module-import.ts',
                'no-restricted-imports',
                'depends on none',
            ],
            [
                'src/modules/notes/ui/views/forbidden-service.view.tsx',
                'no-restricted-imports',
                'service',
            ],
            [
                'src/modules/notes/ui/views/forbidden-use.view.tsx',
                'no-restricted-syntax',
                'decision 0009',
            ],
            [
                'src/modules/notes/hooks/forbidden-action.ts',
                'no-restricted-imports',
                'rule 21',
            ],
            [
                'src/modules/notes/data/forbidden-enum.ts',
                'no-restricted-syntax',
                'enums are forbidden',
            ],
            [
                'src/modules/notes/hooks/forbidden-mock.spec.ts',
                'no-restricted-syntax',
                'decision 0001',
            ],
        ])('rejects %s', (file, ruleId, reason) => {
            expect(messagesOf(file)).toEqual([
                expect.objectContaining({
                    ruleId,
                    message: expect.stringContaining(reason),
                }),
            ]);
        });

        it.each([
            'src/modules/notes/ui/views/allowed.view.tsx',
            'src/modules/notes/hooks/allowed-toast.ts',
            'src/modules/notes/hooks/allowed-relative-import.ts',
            'src/app/allowed-module-entry.ts',
            'src/shared/allowed-shared-import.ts',
        ])('accepts %s', (file) => {
            expect(messagesOf(file)).toEqual([]);
        });
    });
});
