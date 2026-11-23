import { Module } from '@nestjs/common';
import { PairingServiceModule } from './pairing-service.module';
import {
    CreateCoupleController,
    GetMyCoupleController,
    JoinCoupleController,
    RenewInvitationCodeController,
} from './primary/controllers';

@Module({
    imports: [PairingServiceModule],
    controllers: [
        CreateCoupleController,
        JoinCoupleController,
        RenewInvitationCodeController,
        GetMyCoupleController,
    ],
})
export class PairingModule {}
