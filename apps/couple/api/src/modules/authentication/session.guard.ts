import {
    type CanActivate,
    Injectable,
    type ExecutionContext as NestExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import {
    AuthenticationExceptionCodeEnum,
    SESSION_COOKIE_NAME,
} from '@cocooning/couple-contract/authentication';
import { IS_PUBLIC_KEY } from '@cocooning/server-infrastructure/nest';
import type { PartnerContext } from '@cocooning/shared-kernel/domain';
import { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { Request } from 'express';
import { AuthenticationException } from '@cocooning/couple-server-business-logic/authentication';
import { attachPartnerContext } from './partner-context.request';
import { SESSION_TOKEN_ALGORITHM } from './session-token-algorithm';
import { SessionTokenPayloadSchema } from './session-token-payload';

const MILLISECONDS_PER_SECOND = 1_000;

const sessionInvalid = (): AuthenticationException =>
    new AuthenticationException({
        code: AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_INVALID,
        message: 'Session invalid',
    });

// Fail-closed: every route needs a valid session cookie unless it is marked @Public() (decision 0030).
@Injectable()
export class SessionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly dateTimeProvider: DateTimeProvider,
    ) {}

    async canActivate(context: NestExecutionContext): Promise<boolean> {
        if (this.isPublic(context)) return true;
        const request = context.switchToHttp().getRequest<Request>();
        const partner = await this.verify(this.readSessionToken(request));
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

    private async verify(token: string): Promise<PartnerContext> {
        const payload = await this.decode(token);
        const parsed = SessionTokenPayloadSchema.safeParse(payload);
        if (!parsed.success) throw sessionInvalid();
        return { userId: parsed.data.sub };
    }

    private async decode(token: string): Promise<object> {
        const now = this.dateTimeProvider.now().getTime();
        try {
            return await this.jwtService.verifyAsync<object>(token, {
                algorithms: [SESSION_TOKEN_ALGORITHM],
                clockTimestamp: Math.floor(now / MILLISECONDS_PER_SECOND),
            });
        } catch {
            throw sessionInvalid();
        }
    }
}
