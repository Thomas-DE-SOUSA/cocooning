import { Module } from '@nestjs/common';
import { AuthenticationServiceModule } from './authentication-service.module';
import { SignInController, SignOutController } from './primary/controllers';

// Exports the use cases so that AppModule can build the global SessionGuard on ResolveSessionUseCase.
@Module({
    imports: [AuthenticationServiceModule],
    controllers: [SignInController, SignOutController],
    exports: [AuthenticationServiceModule],
})
export class AuthenticationModule {}
