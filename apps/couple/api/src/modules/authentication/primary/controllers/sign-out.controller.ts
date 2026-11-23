import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { SignOutUseCase } from '@cocooning/couple-server-business-logic/authentication';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { PartnerContext } from '@cocooning/shared-kernel/domain';
import { CurrentPartner } from '../../current-partner.decorator';

// Closes every session of the partner, on every device (R5).
@Controller()
export class SignOutController {
    constructor(private readonly signOutUseCase: SignOutUseCase) {}

    @Delete(ApiRouterEnum.ACCOUNT_SESSION_CLOSE)
    @HttpCode(HttpStatus.NO_CONTENT)
    async handle(@CurrentPartner() partner: PartnerContext): Promise<void> {
        await this.signOutUseCase.execute(partner);
    }
}
