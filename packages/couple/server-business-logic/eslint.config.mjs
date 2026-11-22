import { boundariesConfig } from '@cocooning/eslint-config/boundaries';
import { nestConfig } from '@cocooning/eslint-config/nest';

/** @type {import("eslint").Linter.Config[]} */
export default [...nestConfig, ...boundariesConfig];
