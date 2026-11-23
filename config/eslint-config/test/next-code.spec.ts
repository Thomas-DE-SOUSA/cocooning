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
});
