import { Controller, Get, UseInterceptors } from '@nestjs/common';
import {
    type CoupleResponse,
    CoupleResponseSchema,
} from '@cocooning/couple-contract/pairing';
import { GetMyCoupleUseCase } from '@cocooning/couple-server-business-logic/pairing';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ZodResponse } from '@cocooning/server-infrastructure/nest';
import type { PartnerContext } from '@cocooning/shared-kernel/domain';
import { CurrentPartner } from '../../../authentication';
import { toCoupleResponse } from '../mappers';

@Controller()
export class GetMyCoupleController {
    constructor(private readonly getMyCoupleUseCase: GetMyCoupleUseCase) {}

    @Get(ApiRouterEnum.COUPLE_GET_MINE)
    @UseInterceptors(ZodResponse(CoupleResponseSchema))
    async handle(
        @CurrentPartner() partner: PartnerContext,
    ): Promise<CoupleResponse> {
        return toCoupleResponse(await this.getMyCoupleUseCase.execute(partner));
    }
}
