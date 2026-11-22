import { JoinCoupleRequestSchema } from './join-couple.request';

describe('Feature: the invitation code entered to join a couple', () => {
    describe('Scenario: a code typed with surrounding spaces', () => {
        it('accepts it without them, the domain normalizing the rest', () => {
            expect(
                JoinCoupleRequestSchema.parse({
                    invitationCode: '  abcd efgh ',
                }),
            ).toEqual({ invitationCode: 'abcd efgh' });
        });
    });

    describe('Scenario: an unusable entry', () => {
        it.each([
            ['a missing code', {}],
            ['an empty code', { invitationCode: '' }],
            ['a code made of spaces', { invitationCode: '   ' }],
            [
                'a code longer than 32 characters',
                { invitationCode: 'A'.repeat(33) },
            ],
            ['a code that is not a string', { invitationCode: 12345678 }],
        ])('rejects %s', (_label, body) => {
            expect(JoinCoupleRequestSchema.safeParse(body).success).toBe(false);
        });
    });
});
