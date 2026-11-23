import { Controller, Post, UseInterceptors } from '@nestjs/common';
import {
    type CoupleResponse,
    CoupleResponseSchema,
} from '@cocooning/couple-contract/pairing';
import { CreateCoupleUseCase } from '@cocooning/couple-server-business-logic/pairing';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ZodResponse } from '@cocooning/server-infrastructure/nest';
import type { PartnerContext } from '@cocooning/shared-kernel/domain';
import { CurrentPartner } from '../../../authentication';
import { toCoupleResponse } from '../mappers';

@Controller()
export class CreateCoupleController {
    constructor(private readonly createCoupleUseCase: CreateCoupleUseCase) {}

    @Post(ApiRouterEnum.COUPLE_CREATE)
    @UseInterceptors(ZodResponse(CoupleResponseSchema))
    async handle(
        @CurrentPartner() partner: PartnerContext,
    ): Promise<CoupleResponse> {
        return toCoupleResponse(
            await this.createCoupleUseCase.execute(partner),
        );
    }
}
