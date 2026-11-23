import { loadNotes } from '../../services/load-notes.service';

export function ForbiddenServiceView() {
    return <p>{String(loadNotes)}</p>;
}
