import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseInterceptors,
} from '@nestjs/common';
import {
    type SignInRequest,
    SignInRequestSchema,
    type SignInResponse,
    SignInResponseSchema,
} from '@cocooning/couple-contract/authentication';
import { SignInUseCase } from '@cocooning/couple-server-business-logic/authentication';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    Public,
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import { toSignInResponse } from '../mappers';

// The token goes back in the body: the PWA server action sets the HttpOnly cookie (decision 0034).
@Controller()
export class SignInController {
    constructor(private readonly signInUseCase: SignInUseCase) {}

    @Public()
    @Post(ApiRouterEnum.ACCOUNT_SESSION_OPEN)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ZodResponse(SignInResponseSchema))
    async handle(
        @Body(new ZodValidationPipe(SignInRequestSchema))
        request: SignInRequest,
    ): Promise<SignInResponse> {
        return toSignInResponse(await this.signInUseCase.execute(request));
    }
}
