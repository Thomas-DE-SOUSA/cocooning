import { lintFixture } from './lint-fixture';

describe('restricted code (base.js and business-logic.js on a fake business package)', () => {
    const { status, messagesOf } = lintFixture('restricted-code');

    it('fails the lint when a fixture breaks a rule', () => {
        expect(status).toBe(1);
    });

    it.each([
        [
            'forbidden-jest-fn.spec.ts',
            'no-restricted-syntax',
            'Automatic mocks are forbidden',
        ],
        [
            'forbidden-jest-spy-on.spec.ts',
            'no-restricted-syntax',
            'Automatic mocks are forbidden',
        ],
        [
            'forbidden-jest-mock.spec.ts',
            'no-restricted-syntax',
            'Automatic mocks are forbidden',
        ],
        [
            'forbidden-jest-fn.integration-spec.ts',
            'no-restricted-syntax',
            'Automatic mocks are forbidden',
        ],
        [
            'forbidden-enum.spec.ts',
            'no-restricted-syntax',
            'TypeScript enums are forbidden',
        ],
        [
            'forbidden-math-random.ts',
            'no-restricted-properties',
            'decision 0024',
        ],
        [
            'forbidden-random-uuid.ts',
            'no-restricted-properties',
            'decision 0024',
        ],
        [
            'forbidden-node-crypto-random-uuid.ts',
            'no-restricted-imports',
            'decision 0024',
        ],
        ['forbidden-uuid-import.ts', 'no-restricted-imports', 'decision 0024'],
    ])('rejects %s', (file, ruleId, message) => {
        expect(messagesOf(file)).toEqual([
            expect.objectContaining({
                ruleId,
                message: expect.stringContaining(message),
            }),
        ]);
    });

    it.each(['allowed-jest-fn.e2e-spec.ts', 'allowed-business-code.ts'])(
        'accepts %s',
        (file) => {
            expect(messagesOf(file)).toEqual([]);
        },
    );
});
