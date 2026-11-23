import { toast } from '@cocooning/design-system';

export const showError = (error: Error) =>
    toast.error('Save failed', { description: error.message });
