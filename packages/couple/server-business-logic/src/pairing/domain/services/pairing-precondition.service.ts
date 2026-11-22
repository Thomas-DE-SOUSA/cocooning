import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { PairingException } from '../exceptions/pairing.exception';
import type { Couple } from '../models/couple.aggregate';
import type { CoupleRepository } from '../ports/couple.repository';

export class PairingPreconditionService {
    constructor(private readonly coupleRepository: CoupleRepository) {}

    // R1: a partner belongs to one couple at a time.
    async ensurePartnerHasNoCouple(userId: string): Promise<void> {
        const couple = await this.coupleRepository.findByPartner(userId);
        if (couple === null) return;
        throw new PairingException({
            code: PairingExceptionCodeEnum.PAIRING_PARTNER_ALREADY_IN_COUPLE,
            message: 'Partner already in a couple',
        });
    }

    async loadCoupleOfPartner(userId: string): Promise<Couple> {
        const couple = await this.coupleRepository.findByPartner(userId);
        if (couple !== null) return couple;
        throw new PairingException({
            code: PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_FOUND,
            message: 'Couple not found',
        });
    }

    // R6: an unknown code gets the same answer as an expired or used one.
    async loadCoupleByInvitationCode(code: string): Promise<Couple> {
        const couple = await this.coupleRepository.findByInvitationCode(code);
        if (couple !== null) return couple;
        throw new PairingException({
            code: PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
            message: 'Invalid invitation code',
        });
    }
}
