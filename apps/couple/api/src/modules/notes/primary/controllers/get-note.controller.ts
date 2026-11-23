import {
    Controller,
    Get,
    Param,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type NoteParamsRequest,
    NoteParamsRequestSchema,
    type NoteResponse,
    NoteResponseSchema,
} from '@cocooning/couple-contract/notes';
import { GetNoteUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toNoteResponse } from '../mappers';

// R4: one note the partner sees, opened from the list.
@Controller()
@UseGuards(NoteCoupleGuard)
export class GetNoteController {
    constructor(private readonly getNoteUseCase: GetNoteUseCase) {}

    @Get(ApiRouterEnum.NOTE_GET)
    @UseInterceptors(ZodResponse(NoteResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(NoteParamsRequestSchema))
        params: NoteParamsRequest,
    ): Promise<NoteResponse> {
        return toNoteResponse(
            await this.getNoteUseCase.execute(couple, params),
        );
    }
}
