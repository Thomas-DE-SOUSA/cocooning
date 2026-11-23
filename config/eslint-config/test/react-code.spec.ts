import { lintFixture } from './lint-fixture';

describe('React rules (react.js on a fake React library)', () => {
    const { status, messagesOf } = lintFixture('react-code');

    it('fails the lint when a fixture breaks a rule', () => {
        expect(status).toBe(1);
    });

    it.each([
        ['forbidden-array-index-key.tsx', '@eslint-react/no-array-index-key'],
        ['forbidden-too-long.tsx', 'max-lines'],
    ])('rejects %s', (file, ruleId) => {
        expect(messagesOf(file)).toEqual([expect.objectContaining({ ruleId })]);
    });

    it('accepts a component that follows the rules', () => {
        expect(messagesOf('allowed-component.tsx')).toEqual([]);
    });
});
