import {
    type PairingExceptionCode,
    PairingExceptionCodeEnum,
} from '@cocooning/couple-contract/pairing';
import { violatedUniqueConstraint } from '@cocooning/couple-prisma/errors';
import { PairingException } from '@cocooning/couple-server-business-logic/pairing';

type Conflict = {
    readonly code: PairingExceptionCode;
    readonly message: string;
};

// Constraint names of the init migration (docs/couple/architecture/pairing/tables.md); messages as the domain words them.
const CONFLICT_BY_CONSTRAINT: Readonly<Record<string, Conflict>> = {
    couple_partner_user_id_key: {
        code: PairingExceptionCodeEnum.PAIRING_PARTNER_ALREADY_IN_COUPLE,
        message: 'Partner already in a couple',
    },
    couple_invitation_code_key: {
        code: PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_CONFLICT,
        message: 'Invitation code already in use',
    },
    pairing_event_aggregate_id_version_key: {
        code: PairingExceptionCodeEnum.PAIRING_COUPLE_VERSION_CONFLICT,
        message: 'Couple changed since it was read',
    },
};

export function toCoupleConflict(error: unknown): PairingException | null {
    const constraint = violatedUniqueConstraint(error);
    if (constraint === null) return null;
    const conflict = CONFLICT_BY_CONSTRAINT[constraint];
    return conflict === undefined ? null : new PairingException(conflict);
}
