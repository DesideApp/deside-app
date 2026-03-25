# Passport First

`Passport first, enrich after` is the identity architecture Deside is already moving through in production.

## What It Means

When a canonical passport layer is present, Deside should use that as the base identity anchor.

Then it should enrich that identity with protocol-native data from other systems.

In practical terms:

1. resolve passport base first when available
2. enrich with protocol-specific metadata and reputation
3. expose one visible participant identity through the public contract

## Why MPL Agent Registry (Metaplex) Matters

MPL Agent Registry (Metaplex) matters because it is a strong candidate for the base identity question:

- is this wallet controlling a recognized on-chain agent identity?

It is useful as an anchor precisely because it aims to stay minimal.

That does not remove the need for richer systems such as:

- Quantu 8004-Solana for ATOM reputation and richer registry-native metadata
- Cascade SATI for trust signals
- SAID Protocol for additional protocol-native identity and reputation signals

## Today

Today, the ecosystem is still pre-convergence.

So Deside must continue to support one passport anchor plus multiple protocol identity and enrichment sources:

- agents that only exist in Quantu 8004-Solana
- agents that only exist in Cascade SATI
- agents that only exist in SAID Protocol
- agents with no MPL Agent Registry (Metaplex) anchor yet

This is why passport-first cannot mean passport-only.

## What Deside Does With It

When a passport exists:

- it acts as the base identity anchor
- Deside can preserve protocol-native enrichment on top

When a passport does not exist:

- Deside can still resolve the participant through supported protocol paths

That keeps the product compatible with the current ecosystem while reducing future fragmentation.

## Important Clarification

Passport-first does not mean:

- replace all protocols with MPL Agent Registry (Metaplex)
- discard protocol-native reputation
- require migration before Deside can support an agent
- pretend convergence is already complete

It means:

- use the best available identity anchor
- keep backward-compatible fallback behavior
- prevent protocol fragmentation from leaking into the conversation experience
