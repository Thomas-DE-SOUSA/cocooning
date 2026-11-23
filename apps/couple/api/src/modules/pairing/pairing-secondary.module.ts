import { Module } from '@nestjs/common';
import { CoupleRepository } from '@cocooning/couple-server-business-logic/pairing';
import { CouplePrismaRepository } from './secondary/repositories';

const adapters = [
    { provide: CoupleRepository, useClass: CouplePrismaRepository },
];

@Module({ providers: adapters, exports: [CoupleRepository] })
export class PairingSecondaryModule {}
