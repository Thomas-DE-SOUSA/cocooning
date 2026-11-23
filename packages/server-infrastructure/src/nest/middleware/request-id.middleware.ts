import { Injectable, type NestMiddleware } from '@nestjs/common';
import { UuidGenerator } from '@cocooning/shared-kernel/ports';
import type { NextFunction, Request, Response } from 'express';
import { requestContext } from './request-context';

export const REQUEST_ID_HEADER = 'Request-Id';
const VALID_REQUEST_ID = /^[A-Za-z0-9-]{1,64}$/;

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
    constructor(private readonly uuidGenerator: UuidGenerator) {}

    use(request: Request, response: Response, next: NextFunction): void {
        const requestId = this.resolveRequestId(
            request.header(REQUEST_ID_HEADER),
        );
        response.setHeader(REQUEST_ID_HEADER, requestId);
        requestContext.run({ requestId }, next);
    }

    private resolveRequestId(incoming: string | undefined): string {
        if (incoming !== undefined && VALID_REQUEST_ID.test(incoming))
            return incoming;
        return this.uuidGenerator.generate();
    }
}
