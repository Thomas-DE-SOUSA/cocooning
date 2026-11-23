import {
    Injectable,
    mixin,
    type NestInterceptor,
    type Type,
} from '@nestjs/common';
import { Logger } from '@cocooning/shared-kernel/ports';
import type { z } from 'zod';
import { ZodResponseInterceptor } from './zod-response.interceptor';

export function ZodResponse<TSchema extends z.ZodType>(
    schema: TSchema,
): Type<NestInterceptor> {
    @Injectable()
    class ZodResponseMixin extends ZodResponseInterceptor<TSchema> {
        constructor(logger: Logger) {
            super(schema, logger);
        }
    }
    return mixin(ZodResponseMixin);
}
