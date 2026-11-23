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
    type NoteParamsRequest,
    NoteParamsRequestSchema,
    type NoteResponse,
    NoteResponseSchema,
    type RenameNoteRequest,
    RenameNoteRequestSchema,
} from '@cocooning/couple-contract/notes';
import { RenameNoteUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toNoteResponse } from '../mappers';

// R6: either partner renames a note they see.
@Controller()
@UseGuards(NoteCoupleGuard)
export class RenameNoteController {
    constructor(private readonly renameNoteUseCase: RenameNoteUseCase) {}

    @Patch(ApiRouterEnum.NOTE_RENAME)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ZodResponse(NoteResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(NoteParamsRequestSchema))
        params: NoteParamsRequest,
        @Body(new ZodValidationPipe(RenameNoteRequestSchema))
        request: RenameNoteRequest,
    ): Promise<NoteResponse> {
        return toNoteResponse(
            await this.renameNoteUseCase.execute(couple, {
                ...params,
                ...request,
            }),
        );
    }
}
