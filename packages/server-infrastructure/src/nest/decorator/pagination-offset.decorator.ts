import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { OffsetPaginationParams } from '@cocooning/shared-kernel/domain';
import type { Request } from 'express';
import { parseOffsetPagination } from '../pagination/parse-offset-pagination';

export const PaginationOffset = createParamDecorator(
    (_data: unknown, context: ExecutionContext): OffsetPaginationParams =>
        parseOffsetPagination(
            context.switchToHttp().getRequest<Request>().query,
        ),
);
