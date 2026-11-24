import {
    Body,
    Controller,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type MessageFeedItemResponse,
    MessageFeedItemResponseSchema,
    type SendFlashMessageRequest,
    SendFlashMessageRequestSchema,
} from '@cocooning/couple-contract/messaging';
import { SendFlashMessageUseCase } from '@cocooning/couple-server-business-logic/messaging';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, MessagingCoupleGuard } from '../couple';
import { toMessageFeedItemResponse } from '../mappers';

// R1, R2: a word of the couple, owned by its author.
@Controller()
@UseGuards(MessagingCoupleGuard)
export class SendFlashMessageController {
    constructor(
        private readonly sendFlashMessageUseCase: SendFlashMessageUseCase,
    ) {}

    @Post(ApiRouterEnum.FLASH_MESSAGE_SEND)
    @UseInterceptors(ZodResponse(MessageFeedItemResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Body(new ZodValidationPipe(SendFlashMessageRequestSchema))
        request: SendFlashMessageRequest,
    ): Promise<MessageFeedItemResponse> {
        return toMessageFeedItemResponse(
            await this.sendFlashMessageUseCase.execute(couple, request),
        );
    }
}
