import {
    Body,
    Controller,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type CreateFolderRequest,
    CreateFolderRequestSchema,
    type FolderResponse,
    FolderResponseSchema,
} from '@cocooning/couple-contract/notes';
import { CreateFolderUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toFolderResponse } from '../mappers';

// R13: a new folder in a space or in one of its folders.
@Controller()
@UseGuards(NoteCoupleGuard)
export class CreateFolderController {
    constructor(private readonly createFolderUseCase: CreateFolderUseCase) {}

    @Post(ApiRouterEnum.FOLDER_CREATE)
    @UseInterceptors(ZodResponse(FolderResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Body(new ZodValidationPipe(CreateFolderRequestSchema))
        request: CreateFolderRequest,
    ): Promise<FolderResponse> {
        return toFolderResponse(
            await this.createFolderUseCase.execute(couple, request),
        );
    }
}
