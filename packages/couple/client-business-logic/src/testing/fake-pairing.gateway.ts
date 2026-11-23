import type {
    CoupleResponse,
    JoinCoupleRequest,
} from '@cocooning/couple-contract/pairing';
import { CouplePairingStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { PairingGateway } from '../pairing/domain/ports/pairing.gateway';
import type { ApiError } from '../shared/api-error';

export type PairingGatewayCall =
    | { readonly operation: 'getMyCouple' }
    | { readonly operation: 'createCouple' }
    | { readonly operation: 'joinCouple'; readonly request: JoinCoupleRequest }
    | { readonly operation: 'renewInvitationCode' };

export const A_PENDING_COUPLE: CoupleResponse = {
    coupleId: '01936b2e-7c4a-7000-8000-0000000000c1',
    pairingStatus: CouplePairingStatusEnum.PENDING,
    partners: [
        {
            userId: '01936b2e-7c4a-7000-8000-0000000000a1',
            joinedAt: '2026-11-23T08:00:00.000Z',
        },
    ],
    invitationCode: {
        value: 'K7M2Q9XR',
        expiresAt: '2026-11-25T08:00:00.000Z',
    },
};

export const A_PAIRED_COUPLE: CoupleResponse = {
    ...A_PENDING_COUPLE,
    pairingStatus: CouplePairingStatusEnum.PAIRED,
    partners: [
        ...A_PENDING_COUPLE.partners,
        {
            userId: '01936b2e-7c4a-7000-8000-0000000000a2',
            joinedAt: '2026-11-23T09:00:00.000Z',
        },
    ],
    invitationCode: null,
};

// One couple answers every call, or one refusal does.
export class FakePairingGateway extends PairingGateway {
    readonly calls: PairingGatewayCall[] = [];
    private couple: CoupleResponse = A_PENDING_COUPLE;
    private refusal: ApiError | null = null;

    givenCouple(couple: CoupleResponse): void {
        this.couple = couple;
    }

    givenRefusal(error: ApiError): void {
        this.refusal = error;
    }

    override getMyCouple(): Promise<Result<CoupleResponse, ApiError>> {
        return this.answer({ operation: 'getMyCouple' });
    }

    override createCouple(): Promise<Result<CoupleResponse, ApiError>> {
        return this.answer({ operation: 'createCouple' });
    }

    override joinCouple(
        request: JoinCoupleRequest,
    ): Promise<Result<CoupleResponse, ApiError>> {
        return this.answer({ operation: 'joinCouple', request });
    }

    override renewInvitationCode(): Promise<Result<CoupleResponse, ApiError>> {
        return this.answer({ operation: 'renewInvitationCode' });
    }

    private answer(
        call: PairingGatewayCall,
    ): Promise<Result<CoupleResponse, ApiError>> {
        this.calls.push(call);
        return Promise.resolve(
            this.refusal === null ? ok(this.couple) : fail(this.refusal),
        );
    }
}
