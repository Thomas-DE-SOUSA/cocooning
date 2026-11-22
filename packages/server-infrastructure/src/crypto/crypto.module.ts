import { Global, Module } from '@nestjs/common';
import { SecureRandomGenerator } from '@cocooning/shared-kernel/ports';
import { NodeSecureRandomGenerator } from './node-secure-random-generator';

@Global()
@Module({
    providers: [
        { provide: SecureRandomGenerator, useClass: NodeSecureRandomGenerator },
    ],
    exports: [SecureRandomGenerator],
})
export class CryptoModule {}
