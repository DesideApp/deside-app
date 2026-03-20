# Passport First

`Passport first, enrich after` is the direction for Deside's identity model.

## What It Means

When a canonical passport layer is present, Deside should use that as the base identity anchor.

Then it should enrich that identity with protocol-native data from other systems.

In practical terms:

1. resolve passport base first when available
2. enrich with protocol-specific metadata and reputation
3. expose one normalized identity through `agentMeta`

## Why MIP-014 Matters

MIP-014 is useful because it aims to be a minimal, canonical passport for agent identity on Solana.

That makes it a strong candidate for the base question:

- is this wallet controlling a recognized on-chain agent identity?

But MIP-014 is intentionally minimal.

It does not remove the need for richer systems such as:

- 8004 for ATOM reputation and richer registry-native metadata
- SATI for SAS attestations
- SAID for additional identity and ecosystem signals

## Today

Today, the ecosystem is still pre-convergence.

So Deside must continue to support:

- agents that only exist in 8004
- agents that only exist in SATI
- agents that only exist in SAID
- agents with no MIP-014 passport yet

## Tomorrow

If a shared passport layer becomes more common, Deside should not duplicate agents in the product.

The same participant can be:

- passport base: MIP-014
- enrichment source: 8004
- enrichment source: SATI
- enrichment source: SAID

Still one agent.

## Important Clarification

Passport-first does not mean:

- replace all protocols with MIP-014
- discard registry-native reputation
- require migration before Deside can support an agent

It means:

- use the best available identity anchor
- keep backward-compatible fallback behavior
- prevent protocol fragmentation from leaking into the conversation experience
