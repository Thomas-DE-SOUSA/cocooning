import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CancelCoupleUseCase } from '@cocooning/couple-server-business-logic/pairing';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { PartnerContext } from '@cocooning/shared-kernel/domain';
import { CurrentPartner } from '../../../authentication';

// R8: the single partner of a pending couple cancels it.
@Controller()
export class CancelCoupleController {
    constructor(private readonly cancelCoupleUseCase: CancelCoupleUseCase) {}

    @Delete(ApiRouterEnum.COUPLE_CANCEL)
    @HttpCode(HttpStatus.NO_CONTENT)
    async handle(@CurrentPartner() partner: PartnerContext): Promise<void> {
        await this.cancelCoupleUseCase.execute(partner);
    }
}
