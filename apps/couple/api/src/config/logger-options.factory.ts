import { ConfigService } from '@nestjs/config';
import type { LoggerModuleAsyncOptions } from '@cocooning/server-infrastructure/logging';
import type { Environment } from '../env';

export const loggerOptionsFactory: LoggerModuleAsyncOptions = {
    inject: [ConfigService],
    useFactory: (config: ConfigService<Environment, true>) => ({
        level: config.getOrThrow('LOG_LEVEL', { infer: true }),
        pretty: config.getOrThrow('LOG_PRETTY', { infer: true }),
    }),
};
