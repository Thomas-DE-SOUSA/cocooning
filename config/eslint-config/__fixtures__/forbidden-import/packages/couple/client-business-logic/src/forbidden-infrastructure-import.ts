// Fixture: the frontend business logic imports an adapter. ESLint must reject this file.
import { httpRequest } from '@cocooning/client-infrastructure/shared/http';

export const value = httpRequest;
