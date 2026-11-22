import { HttpException, HttpStatus } from '@nestjs/common';
import {
    type BaseException,
    isBaseException,
} from '@cocooning/shared-kernel/exceptions';
import type { ExceptionStatusTable } from './exception-status-table';

export type HttpErrorBody = Readonly<Record<string, unknown>> & {
    readonly status: number;
    readonly message: string;
};

export const INTERNAL_ERROR_MESSAGE = 'Internal Server Error';

const internalError = (): HttpErrorBody => ({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: INTERNAL_ERROR_MESSAGE,
});

const fromBaseException = (
    exception: BaseException,
    table: ExceptionStatusTable,
): HttpErrorBody => {
    const status = table[exception.code];
    if (status === undefined) return internalError();
    return {
        status,
        code: exception.code,
        message: exception.message,
        context: exception.context,
    };
};

const fromHttpException = (exception: HttpException): HttpErrorBody => {
    const status = exception.getStatus();
    const response = exception.getResponse();
    if (typeof response === 'string') return { status, message: response };
    return { message: exception.message, ...response, status };
};

export function toHttpErrorBody(
    exception: unknown,
    table: ExceptionStatusTable,
): HttpErrorBody {
    if (isBaseException(exception)) return fromBaseException(exception, table);
    if (exception instanceof HttpException) return fromHttpException(exception);
    return internalError();
}
