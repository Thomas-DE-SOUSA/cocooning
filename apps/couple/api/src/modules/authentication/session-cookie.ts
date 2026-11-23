// Read by the session guard; the authentication context sets it HttpOnly, Secure, SameSite=Lax at sign-in (decision 0030).
export const SESSION_COOKIE_NAME = 'cocooning_session';

export const SESSION_TOKEN_ALGORITHM = 'HS256';
