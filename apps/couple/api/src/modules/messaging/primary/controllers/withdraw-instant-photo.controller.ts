import {
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    UseGuards,
} from '@nestjs/common';
import {
    type InstantPhotoParamsRequest,
    InstantPhotoParamsRequestSchema,
} from '@cocooning/couple-contract/messaging';
import { WithdrawInstantPhotoUseCase } from '@cocooning/couple-server-business-logic/messaging';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ZodValidationPipe } from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, MessagingCoupleGuard } from '../couple';

// R6: the author withdraws their photo, for both partners, and its file is deleted.
@Controller()
@UseGuards(MessagingCoupleGuard)
export class WithdrawInstantPhotoController {
    constructor(
        private readonly withdrawInstantPhotoUseCase: WithdrawInstantPhotoUseCase,
    ) {}

    @Delete(ApiRouterEnum.INSTANT_PHOTO_WITHDRAW)
    @HttpCode(HttpStatus.NO_CONTENT)
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(InstantPhotoParamsRequestSchema))
        params: InstantPhotoParamsRequest,
    ): Promise<void> {
        await this.withdrawInstantPhotoUseCase.execute(couple, params);
    }
}
