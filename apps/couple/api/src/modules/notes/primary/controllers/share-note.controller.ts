import {
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type NoteParamsRequest,
    NoteParamsRequestSchema,
    type NoteResponse,
    NoteResponseSchema,
} from '@cocooning/couple-contract/notes';
import { ShareNoteUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toNoteResponse } from '../mappers';

// R5: the owner shares a note.
@Controller()
@UseGuards(NoteCoupleGuard)
export class ShareNoteController {
    constructor(private readonly shareNoteUseCase: ShareNoteUseCase) {}

    @Post(ApiRouterEnum.NOTE_SHARE)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ZodResponse(NoteResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(NoteParamsRequestSchema))
        params: NoteParamsRequest,
    ): Promise<NoteResponse> {
        return toNoteResponse(
            await this.shareNoteUseCase.execute(couple, params),
        );
    }
}
