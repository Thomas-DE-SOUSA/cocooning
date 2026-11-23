import {
    Body,
    Controller,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type CreateNoteRequest,
    CreateNoteRequestSchema,
    type NoteResponse,
    NoteResponseSchema,
} from '@cocooning/couple-contract/notes';
import { CreateNoteUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toNoteResponse } from '../mappers';

// R1, R2: a new note, shared and owned by its creator.
@Controller()
@UseGuards(NoteCoupleGuard)
export class CreateNoteController {
    constructor(private readonly createNoteUseCase: CreateNoteUseCase) {}

    @Post(ApiRouterEnum.NOTE_CREATE)
    @UseInterceptors(ZodResponse(NoteResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Body(new ZodValidationPipe(CreateNoteRequestSchema))
        request: CreateNoteRequest,
    ): Promise<NoteResponse> {
        return toNoteResponse(
            await this.createNoteUseCase.execute(couple, request),
        );
    }
}
