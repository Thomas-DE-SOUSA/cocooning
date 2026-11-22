import {
    type ArgumentsHost,
    Catch,
    type ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import { isBaseException } from '@cocooning/shared-kernel/exceptions';
import type { Logger } from '@cocooning/shared-kernel/ports';
import type { Request, Response } from 'express';
import { getRequestId } from '../middleware/request-context';
import type { ExceptionStatusTable } from './exception-status-table';
import { type HttpErrorBody, toHttpErrorBody } from './http-error-body';

const FIRST_SERVER_ERROR_STATUS: number = HttpStatus.INTERNAL_SERVER_ERROR;

// The domain knows nothing about HTTP: the status of each exception code comes from the table (decision 0020).
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(
        private readonly statusTable: ExceptionStatusTable,
        private readonly logger: Logger,
    ) {
        this.logger.setContext(HttpExceptionFilter.name);
    }

    catch(exception: unknown, host: ArgumentsHost): void {
        const http = host.switchToHttp();
        const body = toHttpErrorBody(exception, this.statusTable);
        this.log(exception, body, http.getRequest<Request>());
        http.getResponse<Response>().status(body.status).json(body);
    }

    private log(
        exception: unknown,
        body: HttpErrorBody,
        request: Request,
    ): void {
        const context = {
            requestId: getRequestId(),
            method: request.method,
            path: request.path,
            status: body.status,
            code: isBaseException(exception) ? exception.code : null,
        };
        if (body.status < FIRST_SERVER_ERROR_STATUS) {
            this.logger.warn('Request failed', context);
            return;
        }
        this.logger.error('Request failed', { ...context, error: exception });
    }
}
