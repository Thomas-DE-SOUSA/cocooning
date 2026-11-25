import {
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    UseGuards,
} from '@nestjs/common';
import {
    type FlashMessageParamsRequest,
    FlashMessageParamsRequestSchema,
} from '@cocooning/couple-contract/messaging';
import { WithdrawFlashMessageUseCase } from '@cocooning/couple-server-business-logic/messaging';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ZodValidationPipe } from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, MessagingCoupleGuard } from '../couple';

// R6: the author withdraws their word, for both partners.
@Controller()
@UseGuards(MessagingCoupleGuard)
export class WithdrawFlashMessageController {
    constructor(
        private readonly withdrawFlashMessageUseCase: WithdrawFlashMessageUseCase,
    ) {}

    @Delete(ApiRouterEnum.FLASH_MESSAGE_WITHDRAW)
    @HttpCode(HttpStatus.NO_CONTENT)
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(FlashMessageParamsRequestSchema))
        params: FlashMessageParamsRequest,
    ): Promise<void> {
        await this.withdrawFlashMessageUseCase.execute(couple, params);
    }
}
