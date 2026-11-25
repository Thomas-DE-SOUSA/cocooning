import {
    Body,
    Controller,
    Param,
    Put,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type EditFolderTemplateRequest,
    EditFolderTemplateRequestSchema,
    type FolderParamsRequest,
    FolderParamsRequestSchema,
    type FolderResponse,
    FolderResponseSchema,
} from '@cocooning/couple-contract/notes';
import { EditFolderTemplateUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toFolderResponse } from '../mappers';

// R17, R18: from any folder of a smart tree; answers the folder that holds the template.
@Controller()
@UseGuards(NoteCoupleGuard)
export class EditFolderTemplateController {
    constructor(
        private readonly editFolderTemplateUseCase: EditFolderTemplateUseCase,
    ) {}

    @Put(ApiRouterEnum.FOLDER_TEMPLATE_EDIT)
    @UseInterceptors(ZodResponse(FolderResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(FolderParamsRequestSchema))
        params: FolderParamsRequest,
        @Body(new ZodValidationPipe(EditFolderTemplateRequestSchema))
        request: EditFolderTemplateRequest,
    ): Promise<FolderResponse> {
        return toFolderResponse(
            await this.editFolderTemplateUseCase.execute(couple, {
                ...params,
                ...request,
            }),
        );
    }
}
