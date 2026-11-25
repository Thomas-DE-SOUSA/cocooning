import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type FolderParamsRequest,
    FolderParamsRequestSchema,
    type FolderResponse,
    FolderResponseSchema,
    type RenameFolderRequest,
    RenameFolderRequestSchema,
} from '@cocooning/couple-contract/notes';
import { RenameFolderUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toFolderResponse } from '../mappers';

// R14: either partner renames a folder they see.
@Controller()
@UseGuards(NoteCoupleGuard)
export class RenameFolderController {
    constructor(private readonly renameFolderUseCase: RenameFolderUseCase) {}

    @Patch(ApiRouterEnum.FOLDER_RENAME)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ZodResponse(FolderResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(FolderParamsRequestSchema))
        params: FolderParamsRequest,
        @Body(new ZodValidationPipe(RenameFolderRequestSchema))
        request: RenameFolderRequest,
    ): Promise<FolderResponse> {
        return toFolderResponse(
            await this.renameFolderUseCase.execute(couple, {
                ...params,
                ...request,
            }),
        );
    }
}
