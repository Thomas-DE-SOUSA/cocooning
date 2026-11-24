import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Put,
    UseGuards,
} from '@nestjs/common';
import {
    type SubscribePushNotificationsRequest,
    SubscribePushNotificationsRequestSchema,
} from '@cocooning/couple-contract/messaging';
import { SubscribePushNotificationsUseCase } from '@cocooning/couple-server-business-logic/messaging';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ZodValidationPipe } from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, MessagingCoupleGuard } from '../couple';

// R11: PUT, idempotent on the endpoint: the same phone subscribing again renews its subscription.
@Controller()
@UseGuards(MessagingCoupleGuard)
export class SubscribePushNotificationsController {
    constructor(
        private readonly subscribePushNotificationsUseCase: SubscribePushNotificationsUseCase,
    ) {}

    @Put(ApiRouterEnum.PUSH_SUBSCRIPTION_SUBSCRIBE)
    @HttpCode(HttpStatus.NO_CONTENT)
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Body(new ZodValidationPipe(SubscribePushNotificationsRequestSchema))
        request: SubscribePushNotificationsRequest,
    ): Promise<void> {
        await this.subscribePushNotificationsUseCase.execute(couple, request);
    }
}
