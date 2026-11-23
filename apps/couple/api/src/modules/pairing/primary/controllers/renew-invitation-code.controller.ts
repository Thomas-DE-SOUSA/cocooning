import {
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseInterceptors,
} from '@nestjs/common';
import {
    type CoupleResponse,
    CoupleResponseSchema,
} from '@cocooning/couple-contract/pairing';
import { RenewInvitationCodeUseCase } from '@cocooning/couple-server-business-logic/pairing';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ZodResponse } from '@cocooning/server-infrastructure/nest';
import type { PartnerContext } from '@cocooning/shared-kernel/domain';
import { CurrentPartner } from '../../../authentication';
import { toCoupleResponse } from '../mappers';

@Controller()
export class RenewInvitationCodeController {
    constructor(
        private readonly renewInvitationCodeUseCase: RenewInvitationCodeUseCase,
    ) {}

    @Post(ApiRouterEnum.COUPLE_INVITATION_CODE_RENEW)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ZodResponse(CoupleResponseSchema))
    async handle(
        @CurrentPartner() partner: PartnerContext,
    ): Promise<CoupleResponse> {
        return toCoupleResponse(
            await this.renewInvitationCodeUseCase.execute(partner),
        );
    }
}
