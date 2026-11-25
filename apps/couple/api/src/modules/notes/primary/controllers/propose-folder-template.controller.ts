import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type FolderTemplateProposalResponse,
    FolderTemplateProposalResponseSchema,
    type ProposeFolderTemplateRequest,
    ProposeFolderTemplateRequestSchema,
} from '@cocooning/couple-contract/notes';
import { ProposeFolderTemplateUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';

// R17: the AI proposes a subject and a card template; nothing is created.
@Controller()
@UseGuards(NoteCoupleGuard)
export class ProposeFolderTemplateController {
    constructor(
        private readonly proposeFolderTemplateUseCase: ProposeFolderTemplateUseCase,
    ) {}

    @Post(ApiRouterEnum.FOLDER_TEMPLATE_PROPOSE)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ZodResponse(FolderTemplateProposalResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Body(new ZodValidationPipe(ProposeFolderTemplateRequestSchema))
        request: ProposeFolderTemplateRequest,
    ): Promise<FolderTemplateProposalResponse> {
        const proposal = await this.proposeFolderTemplateUseCase.execute(
            couple,
            request,
        );
        return {
            subject: proposal.subject,
            cardTemplate: [...proposal.cardTemplate],
        };
    }
}
