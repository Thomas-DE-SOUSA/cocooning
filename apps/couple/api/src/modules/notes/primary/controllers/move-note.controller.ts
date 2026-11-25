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
    type MoveNoteRequest,
    MoveNoteRequestSchema,
    type NoteParamsRequest,
    NoteParamsRequestSchema,
    type NoteResponse,
    NoteResponseSchema,
} from '@cocooning/couple-contract/notes';
import { MoveNoteUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toNoteResponse } from '../mappers';

// R11: a note goes into a folder or a space root; the other space by its owner only.
@Controller()
@UseGuards(NoteCoupleGuard)
export class MoveNoteController {
    constructor(private readonly moveNoteUseCase: MoveNoteUseCase) {}

    @Post(ApiRouterEnum.NOTE_MOVE)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ZodResponse(NoteResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(NoteParamsRequestSchema))
        params: NoteParamsRequest,
        @Body(new ZodValidationPipe(MoveNoteRequestSchema))
        request: MoveNoteRequest,
    ): Promise<NoteResponse> {
        return toNoteResponse(
            await this.moveNoteUseCase.execute(couple, {
                ...params,
                ...request,
            }),
        );
    }
}
