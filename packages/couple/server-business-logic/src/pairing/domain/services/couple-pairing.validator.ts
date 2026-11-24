import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import {
    type CouplePairingStatus,
    CouplePairingStatusEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { PairingException } from '../exceptions/pairing.exception';
import type { CouplePartner } from '../models/couple-partner.entity';
import type { InvitationCode } from '../value-objects/invitation-code.vo';

type JoinableState = {
    readonly pairingStatus: CouplePairingStatus;
    readonly invitationCode: InvitationCode | null;
};

const isMember = (
    partners: ReadonlyArray<CouplePartner>,
    userId: string,
): boolean => partners.some((partner) => partner.isUser(userId));

export class CouplePairingValidator {
    // A partner outside the couple must not learn it exists (core.md rule 27).
    static ensureMember(
        partners: ReadonlyArray<CouplePartner>,
        userId: string,
    ): void {
        if (isMember(partners, userId)) return;
        throw new PairingException({
            code: PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_FOUND,
            message: 'Couple not found',
        });
    }

    static ensureNotMember(
        partners: ReadonlyArray<CouplePartner>,
        userId: string,
    ): void {
        if (!isMember(partners, userId)) return;
        throw new PairingException({
            code: PairingExceptionCodeEnum.PAIRING_PARTNER_ALREADY_IN_COUPLE,
            message: 'Partner already in a couple',
        });
    }

    static ensurePending(pairingStatus: CouplePairingStatus): void {
        if (pairingStatus === CouplePairingStatusEnum.PENDING) return;
        throw new PairingException({
            code: PairingExceptionCodeEnum.PAIRING_COUPLE_ALREADY_PAIRED,
            message: 'Couple already paired',
        });
    }

    // R9: only a formed couple records its together periods.
    static ensurePaired(pairingStatus: CouplePairingStatus): void {
        if (pairingStatus === CouplePairingStatusEnum.PAIRED) return;
        throw new PairingException({
            code: PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_PAIRED,
            message: 'Couple not paired yet',
        });
    }

    // R6: unknown, expired or used, the answer is the same.
    static ensureJoinableWith(
        state: JoinableState,
        enteredCode: string,
        now: Date,
    ): void {
        const code = state.invitationCode;
        const isPending =
            state.pairingStatus === CouplePairingStatusEnum.PENDING;
        if (isPending && code?.matches(enteredCode) && code.isValidAt(now)) {
            return;
        }
        throw new PairingException({
            code: PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
            message: 'Invalid invitation code',
        });
    }
}
