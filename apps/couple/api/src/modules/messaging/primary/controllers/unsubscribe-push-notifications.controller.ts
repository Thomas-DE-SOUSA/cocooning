import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    type UnsubscribePushNotificationsRequest,
    UnsubscribePushNotificationsRequestSchema,
} from '@cocooning/couple-contract/messaging';
import { UnsubscribePushNotificationsUseCase } from '@cocooning/couple-server-business-logic/messaging';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ZodValidationPipe } from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, MessagingCoupleGuard } from '../couple';

// R11: a POST with the endpoint in its body; the browser knows its endpoint, never the id of the subscription.
@Controller()
@UseGuards(MessagingCoupleGuard)
export class UnsubscribePushNotificationsController {
    constructor(
        private readonly unsubscribePushNotificationsUseCase: UnsubscribePushNotificationsUseCase,
    ) {}

    @Post(ApiRouterEnum.PUSH_SUBSCRIPTION_UNSUBSCRIBE)
    @HttpCode(HttpStatus.NO_CONTENT)
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Body(new ZodValidationPipe(UnsubscribePushNotificationsRequestSchema))
        request: UnsubscribePushNotificationsRequest,
    ): Promise<void> {
        await this.unsubscribePushNotificationsUseCase.execute(couple, request);
    }
}
