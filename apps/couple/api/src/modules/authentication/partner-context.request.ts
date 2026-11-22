import type { PartnerContext } from '@cocooning/shared-kernel/domain';
import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import type { Request } from 'express';
import { AuthenticationException } from './authentication.exception';

const PARTNER_CONTEXT = Symbol('PARTNER_CONTEXT');

type RequestWithPartner = Request & {
    [PARTNER_CONTEXT]?: PartnerContext;
};

export function attachPartnerContext(
    request: Request,
    partner: PartnerContext,
): void {
    (request as RequestWithPartner)[PARTNER_CONTEXT] = partner;
}

// A public route has no partner: reading one there is refused, never answered with an empty context.
export function readPartnerContext(request: Request): PartnerContext {
    const partner = (request as RequestWithPartner)[PARTNER_CONTEXT];
    if (partner === undefined) {
        throw new AuthenticationException({
            code: AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING,
            message: 'No authenticated partner on this request',
        });
    }
    return partner;
}
