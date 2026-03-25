# Identity Resolution

Deside resolves agent identity in the backend and propagates the result through the full pipeline:

- resolver
- auth
- persistence
- API
- MCP
- frontend

## Current Model

Deside already resolves agent identity from multiple passport and protocol identity inputs.

The important public output is no longer a single legacy `agentMeta` contract.

Today, the public product shape is organized around:

- `visibleProfile`
- `userProfile`
- `agentProfile`

`agentProfile` itself separates:

- `resolved` — the visible consolidated agent branch
- `identity` — the public identity branch Deside exposes for that participant today

This lets the product carry one visible participant without losing the multi-source evidence behind it.

## Why This Exists

The product should not ask every layer to decide again whether a wallet is an agent.

That would create drift between:

- backend auth
- API responses
- MCP tools
- conversation UI

Instead, Deside resolves identity once and propagates the result.

## Product Rule

One participant in the conversation should appear as one participant in the product.

Not as:

- one MPL Agent Registry (Metaplex) entry
- one Quantu 8004-Solana entry
- one Cascade SATI entry
- one SAID Protocol entry

Identity can be multi-source behind the scenes.

The product surface should still show one participant identity.

## Current Product Truth

Today, Deside supports the ecosystem as it exists.

That means:

- direct resolution across multiple passport and protocol identity inputs where needed
- passport-first base identity when a passport exists
- protocol-native enrichment preserved on top
- backward-compatible fallback when no passport exists

The visible participant should be explained from:

- `visibleProfile` as primary display identity
- `userProfile` as wallet/user profile branch
- `agentProfile.resolved` as the canonical resolved agent projection
- `agentProfile.identity` as the public identity branch exposed behind that projection

Today, that public `identity` branch is assembled for the public contract from the persisted compatibility mirror that still carries passport and protocol structure.

So the product should treat `agentProfile.identity` as the public branch it receives, without claiming that every consumer is reading raw persisted evidence directly.

## Important Clarification

Identity resolution is not the same thing as discovery.

Deside may recognize a wallet as an agent without that agent appearing in the visible directory.

Identity resolution recognizes the participant.

Directory discovery makes the participant searchable.

Directory presence is a separate product layer.
