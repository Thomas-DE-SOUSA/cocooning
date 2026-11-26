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
    type EditNoteListRequest,
    EditNoteListRequestSchema,
    type NoteListResponse,
    NoteListResponseSchema,
    type NoteParamsRequest,
    NoteParamsRequestSchema,
} from '@cocooning/couple-contract/notes';
import { EditNoteListUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toNoteListResponse } from '../mappers';

// R6, R26: either partner changes the title and the emoji of a list they see.
@Controller()
@UseGuards(NoteCoupleGuard)
export class EditNoteListController {
    constructor(private readonly editNoteListUseCase: EditNoteListUseCase) {}

    @Patch(ApiRouterEnum.NOTE_LIST_EDIT)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ZodResponse(NoteListResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(NoteParamsRequestSchema))
        params: NoteParamsRequest,
        @Body(new ZodValidationPipe(EditNoteListRequestSchema))
        request: EditNoteListRequest,
    ): Promise<NoteListResponse> {
        return toNoteListResponse(
            await this.editNoteListUseCase.execute(couple, {
                ...params,
                ...request,
            }),
        );
    }
}
