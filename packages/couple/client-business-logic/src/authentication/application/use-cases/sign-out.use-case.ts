import { type Result, ok } from '@cocooning/shared-kernel/utils';
import { type ApiError, ApiErrorCodeEnum } from '../../../shared/api-error';
import type { AuthenticationGateway } from '../../domain/ports/authentication.gateway';

// Decision 0034: the API closes the sessions of every device. A session it already refuses is closed too: the PWA drops its cookie either way.
export class SignOutUseCase {
    constructor(
        private readonly authenticationGateway: AuthenticationGateway,
    ) {}

    async execute(): Promise<Result<null, ApiError>> {
        const closed = await this.authenticationGateway.signOut();
        if (closed.success) return closed;
        if (closed.error.code === ApiErrorCodeEnum.UNAUTHORIZED)
            return ok(null);
        return closed;
    }
}
