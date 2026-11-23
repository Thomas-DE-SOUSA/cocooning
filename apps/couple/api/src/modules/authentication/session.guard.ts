import {
    type CanActivate,
    Injectable,
    type ExecutionContext as NestExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
    AuthenticationExceptionCodeEnum,
    SESSION_COOKIE_NAME,
} from '@cocooning/couple-contract/authentication';
import {
    AuthenticationException,
    ResolveSessionUseCase,
} from '@cocooning/couple-server-business-logic/authentication';
import { IS_PUBLIC_KEY } from '@cocooning/server-infrastructure/nest';
import type { Request } from 'express';
import { attachPartnerContext } from './partner-context.request';

// Fail-closed: every route needs a live session unless it is marked @Public(); the use case decides (decision 0034).
@Injectable()
export class SessionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly resolveSessionUseCase: ResolveSessionUseCase,
    ) {}

    async canActivate(context: NestExecutionContext): Promise<boolean> {
        if (this.isPublic(context)) return true;
        const request = context.switchToHttp().getRequest<Request>();
        const partner = await this.resolveSessionUseCase.execute({
            sessionToken: this.readSessionToken(request),
        });
        attachPartnerContext(request, partner);
        return true;
    }

    private isPublic(context: NestExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );
        return isPublic === true;
    }

    private readSessionToken(request: Request): string {
        const cookies = request.cookies as Readonly<Record<string, unknown>>;
        const token = cookies[SESSION_COOKIE_NAME];
        if (typeof token === 'string' && token.length > 0) return token;
        throw new AuthenticationException({
            code: AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING,
            message: 'Session missing',
        });
    }
}
