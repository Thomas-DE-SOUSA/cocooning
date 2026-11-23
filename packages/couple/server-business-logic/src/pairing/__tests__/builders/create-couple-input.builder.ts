import type { CreateCoupleInput } from '../../domain/models/couple.aggregate.type';
import { InvitationCode } from '../../domain/value-objects/invitation-code.vo';
import { PARTNER_A } from '../fixtures/pairing-test.context';

export const INVITATION_CODE_VALUE = 'K7MQ2XPA';
export const INVITATION_CODE_EXPIRES_AT = '2026-11-25T10:00:00.000Z';

export const aCreateCoupleInput = (
    overrides: Partial<CreateCoupleInput> = {},
): CreateCoupleInput => ({
    creatorUserId: PARTNER_A,
    invitationCode: InvitationCode.from({
        value: INVITATION_CODE_VALUE,
        expiresAt: INVITATION_CODE_EXPIRES_AT,
    }),
    ...overrides,
});
