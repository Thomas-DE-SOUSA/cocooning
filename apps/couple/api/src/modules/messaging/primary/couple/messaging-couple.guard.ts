import {
    type CanActivate,
    Injectable,
    type ExecutionContext as NestExecutionContext,
} from '@nestjs/common';
import { MessagingCoupleGuardService } from '@cocooning/couple-server-business-logic/messaging';
import type { Request } from 'express';
import { readPartnerContext } from '../../../authentication';
import { attachExecutionContext } from './execution-context.request';

// Decision 0041: after the session guard, the partner's formed couple becomes the context of the messages; none answers 404 (R4).
@Injectable()
export class MessagingCoupleGuard implements CanActivate {
    constructor(
        private readonly messagingCoupleGuardService: MessagingCoupleGuardService,
    ) {}

    async canActivate(context: NestExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        attachExecutionContext(
            request,
            await this.messagingCoupleGuardService.resolveExecutionContext(
                readPartnerContext(request),
            ),
        );
        return true;
    }
}
