import {
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    UseGuards,
} from '@nestjs/common';
import {
    type NoteParamsRequest,
    NoteParamsRequestSchema,
} from '@cocooning/couple-contract/notes';
import { DeleteNoteUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ZodValidationPipe } from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';

// R7: the owner deletes a note, softly.
@Controller()
@UseGuards(NoteCoupleGuard)
export class DeleteNoteController {
    constructor(private readonly deleteNoteUseCase: DeleteNoteUseCase) {}

    @Delete(ApiRouterEnum.NOTE_DELETE)
    @HttpCode(HttpStatus.NO_CONTENT)
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(NoteParamsRequestSchema))
        params: NoteParamsRequest,
    ): Promise<void> {
        await this.deleteNoteUseCase.execute(couple, params);
    }
}
