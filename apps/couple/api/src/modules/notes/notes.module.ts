import { Module } from '@nestjs/common';
import { NotesServiceModule } from './notes-service.module';

// Controllers arrive with the HTTP contract of notes.
@Module({ imports: [NotesServiceModule] })
export class NotesModule {}
