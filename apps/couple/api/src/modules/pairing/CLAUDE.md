# Module pairing de l'API

Adaptateurs du contexte `pairing` : cinq controleurs (`primary/controllers/`), le mapper `toCoupleResponse` (`primary/mappers/`), `CouplePrismaRepository` (`secondary/repositories/`) et ses mappers Prisma (`secondary/mappers/`, dont `together-periods-prisma.mapper.ts` : colonne JSONB relue par Zod, sinon `PAIRING_COUPLE_DATA_CORRUPTED`), le fragment d'environnement `env.ts` (`PAIRING_INVITATION_CODE_TTL_HOURS`). Les use cases sont construits par `pairingUseCase()` (`pairing-use-case.factory.ts`, exporte par `index.ts`) dans `pairing-service.module.ts`, sauf `RecordTogetherPeriodsUseCase`, fourni par la seule commande `record-together-periods` (`src/commands/`).

Contexte metier :
@../../../../../../packages/couple/server-business-logic/src/pairing/CLAUDE.md

Modeles a copier pour un autre contexte : `primary/controllers/join-couple.controller.ts` (controleur avec corps), `secondary/repositories/couple-prisma.repository.ts` (etat, enfants et outbox dans une transaction ; ses deux recherches sans `coupleId` ne se copient jamais, decision 0029), `test/pairing/` (E2E, concurrence, adaptateur).
