import { INVITATION_CODE_ENTRY_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { createJoinCoupleFormSchema } from './join-couple-form.zod';

const schema = createJoinCoupleFormSchema((key) => `translated:${key}`);

const messagesOf = (invitationCode: string): readonly string[] => {
    const parsed = schema.safeParse({ invitationCode });
    return parsed.success ? [] : parsed.error.issues.map((i) => i.message);
};

describe('Feature: the join form checks the typed invitation code', () => {
    describe('Scenario: R3, a code typed in lower case with spaces', () => {
        it('accepts it without the surrounding spaces, the domain normalizing the rest', () => {
            expect(schema.parse({ invitationCode: '  k7m2 q9xr ' })).toEqual({
                invitationCode: 'k7m2 q9xr',
            });
        });

        it('accepts a code of any shape, only the API can tell a wrong one (R6)', () => {
            expect(messagesOf('ABC')).toEqual([]);
        });
    });

    describe('Scenario: decision 0031, a code to correct', () => {
        it.each([
            ['an empty code', '   ', 'form.invitationCode.errors.required'],
            [
                'a code longer than the bound',
                'A'.repeat(INVITATION_CODE_ENTRY_MAX_LENGTH + 1),
                'form.invitationCode.errors.tooLong',
            ],
        ])('shows the translated message for %s', (_label, code, key) => {
            expect(messagesOf(code)).toEqual([`translated:${key}`]);
        });
    });
});
