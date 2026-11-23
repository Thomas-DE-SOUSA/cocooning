import { toast } from 'sonner';

export function reportFailure(error: Error): void {
    toast.error(error.message);
}
