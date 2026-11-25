import {
    Controller,
    Param,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type MessageFeedItemResponse,
    MessageFeedItemResponseSchema,
    type PhotoPromptParamsRequest,
    PhotoPromptParamsRequestSchema,
} from '@cocooning/couple-contract/messaging';
import { AnswerPhotoPromptUseCase } from '@cocooning/couple-server-business-logic/messaging';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, MessagingCoupleGuard } from '../couple';
import { toMessageFeedItemResponse } from '../mappers';
import {
    InstantPhotoFileInterceptor,
    InstantPhotoTooHeavyInterceptor,
    UploadedInstantPhotoPipe,
} from '../upload';

// R8: the photo of the day, sent like a spontaneous photo (multipart/form-data, INSTANT_PHOTO_FORM_FIELD) to its prompt.
@Controller()
@UseGuards(MessagingCoupleGuard)
export class AnswerPhotoPromptController {
    constructor(
        private readonly answerPhotoPromptUseCase: AnswerPhotoPromptUseCase,
    ) {}

    @Post(ApiRouterEnum.PHOTO_PROMPT_ANSWER)
    @UseInterceptors(
        ZodResponse(MessageFeedItemResponseSchema),
        InstantPhotoTooHeavyInterceptor,
        InstantPhotoFileInterceptor,
    )
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(PhotoPromptParamsRequestSchema))
        params: PhotoPromptParamsRequest,
        @UploadedFile(UploadedInstantPhotoPipe) content: Uint8Array,
    ): Promise<MessageFeedItemResponse> {
        return toMessageFeedItemResponse(
            await this.answerPhotoPromptUseCase.execute(couple, {
                photoPromptId: params.photoPromptId,
                content,
            }),
        );
    }
}
