import {
    type CanActivate,
    Injectable,
    type ExecutionContext as NestExecutionContext,
} from '@nestjs/common';
import { AgendaCoupleGuardService } from '@cocooning/couple-server-business-logic/agenda';
import type { Request } from 'express';
import { readPartnerContext } from '../../../authentication';
import { attachExecutionContext } from './execution-context.request';

// Decision 0041: after the session guard, the partner's formed couple becomes the context of the agenda; none answers 404 (R4).
@Injectable()
export class AgendaCoupleGuard implements CanActivate {
    constructor(
        private readonly agendaCoupleGuardService: AgendaCoupleGuardService,
    ) {}

    async canActivate(context: NestExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        attachExecutionContext(
            request,
            await this.agendaCoupleGuardService.resolveExecutionContext(
                readPartnerContext(request),
            ),
        );
        return true;
    }
}
