---
nature: technique
status: acceptée
date: 2026-11-22
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-22
validated-on: 2026-11-22
supersedes:
superseded-by:
premortem:
---

# 0024: Horloge injectée, identifiants UUID v7 par un générateur configurable

## Contexte

Un test de use case doit être déterministe : mêmes entrées, même sortie, assertions exactes. Chez Malta, `DomainEventBase` lit `new Date()` et les specs se rabattent sur `expect.any(String)` ; deux façons de tirer un identifiant coexistent. Décision D13 du propriétaire, à trancher avant le code du shared-kernel.

## Décision

- **Horloge** : l'heure courante vient toujours du port `DateTimeProvider`, injecté dans les use cases et les services qui en ont besoin. Le domaine reçoit l'instant en paramètre (`now`), il ne lit jamais d'horloge. `DomainEventBase` reçoit son `occurredAt` du constructeur de l'événement.
- **Identifiants** : un identifiant est un UUID v7, tiré par `Uuid.generateValue()` depuis la fabrique `generate()` du value object d'identité. Le générateur est posé une fois par process avec `Uuid.configure()` ; en test, un générateur factice à compteur est posé par le contexte de test, et `Uuid.resetForTests()` le retire entre deux fichiers de spec. C'est le contenu de la [décision 0003](0003-identifiants-uuid-generate-value.md).
- Toute autre source de hasard (heure aléatoire d'une invitation photo, jeton) passe par un port injecté (`core.md` règle 19).

Mots du propriétaire, le 2026-11-22, sur les recommandations du blueprint : « OK pour tout ».

## Alternatives écartées

- **Port `IdGenerator` injecté partout** : il faut le passer à chaque agrégat pour un déterminisme que le générateur configurable donne déjà.
- **`new Date()` dans les événements, comme Malta** : les assertions sur `occurredAt` deviennent approximatives.

## Conséquences

- Le shared-kernel expose `DateTimeProvider`, `UuidGenerator`, `Uuid` (avec `configure`, `isConfigured`, `resetForTests`) et, dans son sous-chemin `testing`, `DeterministicDateTimeProvider` et `FakeUuidV7GeneratorProvider`.
- Les corrections de `Uuid` relevées chez Malta (générateur posé sur la bonne classe, `equals` sûr face à `null`, exception typée) sont faites dès le premier commit.
- La règle ESLint du code métier qui interdit `crypto.randomUUID`, `Math.random` et le paquet `uuid` hors du shared-kernel arrive avec le premier contexte.

## Risques

- `Uuid.configure` est un état global : un oubli de `resetForTests()` fait fuir un générateur d'un test à l'autre dans le même fichier. La spec du shared-kernel couvre la remise à zéro.
