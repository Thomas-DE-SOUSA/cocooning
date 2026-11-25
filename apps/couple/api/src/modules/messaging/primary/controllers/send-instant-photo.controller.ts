import {
    Controller,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type MessageFeedItemResponse,
    MessageFeedItemResponseSchema,
} from '@cocooning/couple-contract/messaging';
import { SendInstantPhotoUseCase } from '@cocooning/couple-server-business-logic/messaging';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ZodResponse } from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, MessagingCoupleGuard } from '../couple';
import { toMessageFeedItemResponse } from '../mappers';
import {
    InstantPhotoFileInterceptor,
    InstantPhotoTooHeavyInterceptor,
    UploadedInstantPhotoPipe,
} from '../upload';

// R1, R3: a photo of the phone camera, sent as multipart/form-data in the INSTANT_PHOTO_FORM_FIELD field.
@Controller()
@UseGuards(MessagingCoupleGuard)
export class SendInstantPhotoController {
    constructor(
        private readonly sendInstantPhotoUseCase: SendInstantPhotoUseCase,
    ) {}

    @Post(ApiRouterEnum.INSTANT_PHOTO_SEND)
    @UseInterceptors(
        ZodResponse(MessageFeedItemResponseSchema),
        InstantPhotoTooHeavyInterceptor,
        InstantPhotoFileInterceptor,
    )
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @UploadedFile(UploadedInstantPhotoPipe) content: Uint8Array,
    ): Promise<MessageFeedItemResponse> {
        return toMessageFeedItemResponse(
            await this.sendInstantPhotoUseCase.execute(couple, { content }),
        );
    }
}
