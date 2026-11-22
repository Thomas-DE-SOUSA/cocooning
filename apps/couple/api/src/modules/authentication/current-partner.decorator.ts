import {
    createParamDecorator,
    type ExecutionContext as NestExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import { readPartnerContext } from './partner-context.request';

export const CurrentPartner = createParamDecorator(
    (_data: unknown, context: NestExecutionContext) =>
        readPartnerContext(context.switchToHttp().getRequest<Request>()),
);
