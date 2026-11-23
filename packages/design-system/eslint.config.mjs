import { boundariesConfig } from '@cocooning/eslint-config/boundaries';
import { reactConfig } from '@cocooning/eslint-config/react';

/** @type {import("eslint").Linter.Config[]} */
export default [...reactConfig, ...boundariesConfig];
