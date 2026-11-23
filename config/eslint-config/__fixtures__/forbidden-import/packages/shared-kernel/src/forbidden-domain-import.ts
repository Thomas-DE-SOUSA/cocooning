// Fixture: a shared package imports a domain. ESLint must reject this file.
import { note } from '@cocooning/couple-shared-kernel';

export const value = note;
