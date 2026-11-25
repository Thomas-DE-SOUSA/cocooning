import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import {
    type PushPublicKeyResponse,
    PushPublicKeyResponseSchema,
} from '@cocooning/couple-contract/messaging';
import { GetPushPublicKeyUseCase } from '@cocooning/couple-server-business-logic/messaging';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ZodResponse } from '@cocooning/server-infrastructure/nest';
import { MessagingCoupleGuard } from '../couple';

// R11: the VAPID public key, served to a partner of a formed couple; the PWA keeps no copy of it.
@Controller()
@UseGuards(MessagingCoupleGuard)
export class GetPushPublicKeyController {
    constructor(
        private readonly getPushPublicKeyUseCase: GetPushPublicKeyUseCase,
    ) {}

    @Get(ApiRouterEnum.PUSH_SUBSCRIPTION_PUBLIC_KEY_GET)
    @UseInterceptors(ZodResponse(PushPublicKeyResponseSchema))
    handle(): PushPublicKeyResponse {
        return this.getPushPublicKeyUseCase.execute();
    }
}
