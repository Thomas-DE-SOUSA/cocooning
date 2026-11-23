import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { UuidV7GeneratorProvider } from '@cocooning/server-infrastructure/identifier';
import { Uuid } from '@cocooning/shared-kernel/domain';
import { Logger } from '@cocooning/shared-kernel/ports';
import { AppModule } from './app.module';
import type { Environment } from './env';

async function bootstrap(): Promise<void> {
    Uuid.configure(new UuidV7GeneratorProvider());
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.enableShutdownHooks();
    const port = app
        .get(ConfigService<Environment, true>)
        .getOrThrow('PORT', { infer: true });
    await app.listen(port);
    const logger = await app.resolve(Logger);
    logger.setContext('Bootstrap');
    logger.info('API listening', { port });
}

void bootstrap();
