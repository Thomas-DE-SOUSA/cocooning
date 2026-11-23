import {
    type CanActivate,
    Injectable,
    type ExecutionContext as NestExecutionContext,
} from '@nestjs/common';
import { NoteCoupleGuardService } from '@cocooning/couple-server-business-logic/notes';
import type { Request } from 'express';
import { readPartnerContext } from '../../../authentication';
import { attachExecutionContext } from './execution-context.request';

// Decision 0041: after the session guard, the partner's formed couple becomes the context of the notes; none answers 404.
@Injectable()
export class NoteCoupleGuard implements CanActivate {
    constructor(
        private readonly noteCoupleGuardService: NoteCoupleGuardService,
    ) {}

    async canActivate(context: NestExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        attachExecutionContext(
            request,
            await this.noteCoupleGuardService.resolveExecutionContext(
                readPartnerContext(request),
            ),
        );
        return true;
    }
}
