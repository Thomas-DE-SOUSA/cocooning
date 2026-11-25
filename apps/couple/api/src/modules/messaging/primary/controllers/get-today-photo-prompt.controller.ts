import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import {
    type TodayPhotoPromptResponse,
    TodayPhotoPromptResponseSchema,
} from '@cocooning/couple-contract/messaging';
import { GetTodayPhotoPromptUseCase } from '@cocooning/couple-server-business-logic/messaging';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ZodResponse } from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, MessagingCoupleGuard } from '../couple';
import { toTodayPhotoPromptResponse } from '../mappers';

// R7, R8: today's photo prompt once issued, null before; its drawn time is never sent.
@Controller()
@UseGuards(MessagingCoupleGuard)
export class GetTodayPhotoPromptController {
    constructor(
        private readonly getTodayPhotoPromptUseCase: GetTodayPhotoPromptUseCase,
    ) {}

    @Get(ApiRouterEnum.PHOTO_PROMPT_TODAY_GET)
    @UseInterceptors(ZodResponse(TodayPhotoPromptResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
    ): Promise<TodayPhotoPromptResponse> {
        return toTodayPhotoPromptResponse(
            await this.getTodayPhotoPromptUseCase.execute(couple),
        );
    }
}
