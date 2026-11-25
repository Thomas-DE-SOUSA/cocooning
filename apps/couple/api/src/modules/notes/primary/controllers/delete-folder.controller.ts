import {
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    UseGuards,
} from '@nestjs/common';
import {
    type FolderParamsRequest,
    FolderParamsRequestSchema,
} from '@cocooning/couple-contract/notes';
import { DeleteFolderUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ZodValidationPipe } from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';

// R16: a folder is deleted softly, its content moves up.
@Controller()
@UseGuards(NoteCoupleGuard)
export class DeleteFolderController {
    constructor(private readonly deleteFolderUseCase: DeleteFolderUseCase) {}

    @Delete(ApiRouterEnum.FOLDER_DELETE)
    @HttpCode(HttpStatus.NO_CONTENT)
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(FolderParamsRequestSchema))
        params: FolderParamsRequest,
    ): Promise<void> {
        await this.deleteFolderUseCase.execute(couple, params);
    }
}
