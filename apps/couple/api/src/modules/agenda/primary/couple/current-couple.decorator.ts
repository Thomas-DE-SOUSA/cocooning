import {
    createParamDecorator,
    type ExecutionContext as NestExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import { readExecutionContext } from './execution-context.request';

export const CurrentCouple = createParamDecorator(
    (_data: unknown, context: NestExecutionContext) =>
        readExecutionContext(context.switchToHttp().getRequest<Request>()),
);
