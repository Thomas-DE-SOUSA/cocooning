import { ConfigService } from '@nestjs/config';
import type { PrismaModuleAsyncOptions } from '@cocooning/couple-prisma/nest';
import type { Environment } from '../env';

export const prismaOptionsFactory: PrismaModuleAsyncOptions = {
    inject: [ConfigService],
    useFactory: (config: ConfigService<Environment, true>) => ({
        connectionString: config.getOrThrow('DATABASE_POSTGRES_URL', {
            infer: true,
        }),
        transaction: {
            timeout: config.getOrThrow('DB_TX_TIMEOUT_MS', { infer: true }),
            maxWait: config.getOrThrow('DB_TX_MAX_WAIT_MS', { infer: true }),
        },
    }),
};
