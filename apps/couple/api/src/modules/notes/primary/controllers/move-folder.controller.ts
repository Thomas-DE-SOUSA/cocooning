import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type FolderParamsRequest,
    FolderParamsRequestSchema,
    type FolderResponse,
    FolderResponseSchema,
    type MoveFolderRequest,
    MoveFolderRequestSchema,
} from '@cocooning/couple-contract/notes';
import { MoveFolderUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toFolderResponse } from '../mappers';

// R15: a folder moves within its space, never into one of its sub-folders.
@Controller()
@UseGuards(NoteCoupleGuard)
export class MoveFolderController {
    constructor(private readonly moveFolderUseCase: MoveFolderUseCase) {}

    @Post(ApiRouterEnum.FOLDER_MOVE)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ZodResponse(FolderResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(FolderParamsRequestSchema))
        params: FolderParamsRequest,
        @Body(new ZodValidationPipe(MoveFolderRequestSchema))
        request: MoveFolderRequest,
    ): Promise<FolderResponse> {
        return toFolderResponse(
            await this.moveFolderUseCase.execute(couple, {
                ...params,
                ...request,
            }),
        );
    }
}
