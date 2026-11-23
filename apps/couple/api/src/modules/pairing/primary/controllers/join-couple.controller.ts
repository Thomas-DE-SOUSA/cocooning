import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseInterceptors,
} from '@nestjs/common';
import {
    type CoupleResponse,
    CoupleResponseSchema,
    type JoinCoupleRequest,
    JoinCoupleRequestSchema,
} from '@cocooning/couple-contract/pairing';
import { JoinCoupleUseCase } from '@cocooning/couple-server-business-logic/pairing';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { PartnerContext } from '@cocooning/shared-kernel/domain';
import { CurrentPartner } from '../../../authentication';
import { toCoupleResponse } from '../mappers';

@Controller()
export class JoinCoupleController {
    constructor(private readonly joinCoupleUseCase: JoinCoupleUseCase) {}

    @Post(ApiRouterEnum.COUPLE_JOIN)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ZodResponse(CoupleResponseSchema))
    async handle(
        @CurrentPartner() partner: PartnerContext,
        @Body(new ZodValidationPipe(JoinCoupleRequestSchema))
        request: JoinCoupleRequest,
    ): Promise<CoupleResponse> {
        return toCoupleResponse(
            await this.joinCoupleUseCase.execute(partner, request),
        );
    }
}
