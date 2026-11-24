import {
    Controller,
    Get,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type MessageFeedPageResponse,
    MessageFeedPageResponseSchema,
} from '@cocooning/couple-contract/messaging';
import {
    type CursorPaginationQuery,
    CursorPaginationQuerySchema,
} from '@cocooning/couple-contract/shared';
import { ListMessageFeedUseCase } from '@cocooning/couple-server-business-logic/messaging';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, MessagingCoupleGuard } from '../couple';
import { toMessageFeedPageResponse } from '../mappers';

// R5: the words and photos of the couple, newest first, page by page (decision 0025).
@Controller()
@UseGuards(MessagingCoupleGuard)
export class ListMessageFeedController {
    constructor(
        private readonly listMessageFeedUseCase: ListMessageFeedUseCase,
    ) {}

    @Get(ApiRouterEnum.MESSAGE_FEED_GET)
    @UseInterceptors(ZodResponse(MessageFeedPageResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Query(new ZodValidationPipe(CursorPaginationQuerySchema))
        query: CursorPaginationQuery,
    ): Promise<MessageFeedPageResponse> {
        return toMessageFeedPageResponse(
            await this.listMessageFeedUseCase.execute(couple, query),
        );
    }
}
