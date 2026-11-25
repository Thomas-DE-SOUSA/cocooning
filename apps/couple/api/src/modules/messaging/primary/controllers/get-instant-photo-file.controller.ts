import {
    Controller,
    Get,
    Param,
    type StreamableFile,
    UseGuards,
} from '@nestjs/common';
import {
    type InstantPhotoParamsRequest,
    InstantPhotoParamsRequestSchema,
} from '@cocooning/couple-contract/messaging';
import { GetInstantPhotoFileUseCase } from '@cocooning/couple-server-business-logic/messaging';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ZodValidationPipe } from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, MessagingCoupleGuard } from '../couple';
import { toInstantPhotoFileResponse } from '../mappers';

// R5: the bytes of a live photo, for the two partners of its couple only.
@Controller()
@UseGuards(MessagingCoupleGuard)
export class GetInstantPhotoFileController {
    constructor(
        private readonly getInstantPhotoFileUseCase: GetInstantPhotoFileUseCase,
    ) {}

    @Get(ApiRouterEnum.INSTANT_PHOTO_FILE_GET)
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(InstantPhotoParamsRequestSchema))
        params: InstantPhotoParamsRequest,
    ): Promise<StreamableFile> {
        return toInstantPhotoFileResponse(
            await this.getInstantPhotoFileUseCase.execute(couple, params),
        );
    }
}
