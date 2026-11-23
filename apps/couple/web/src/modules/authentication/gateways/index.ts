import { authenticationSignInAction } from '../actions/authentication-sign-in.action';
import { authenticationSignOutAction } from '../actions/authentication-sign-out.action';
import type { AuthenticationCommandGateway } from './ports/authentication-command.gateway';
import { ServerActionAuthenticationCommandGateway } from './server-action/server-action-authentication-command.gateway';

export const authenticationCommandGateway: AuthenticationCommandGateway =
    new ServerActionAuthenticationCommandGateway({
        signIn: authenticationSignInAction,
        signOut: authenticationSignOutAction,
    });
export { AuthenticationCommandGateway } from './ports/authentication-command.gateway';
