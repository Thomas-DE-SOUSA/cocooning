import { Global, Module } from '@nestjs/common';
import { UuidGenerator } from '@cocooning/shared-kernel/ports';
import { UuidV7GeneratorProvider } from './uuid-v7-generator.provider';

@Global()
@Module({
    providers: [{ provide: UuidGenerator, useClass: UuidV7GeneratorProvider }],
    exports: [UuidGenerator],
})
export class IdentifierModule {}
