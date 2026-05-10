# Passport And Protocol Registries

Deside does not treat all agent identity inputs as if they answered the same question.

Some inputs are stronger as canonical identity anchors.

Others are better understood as protocol registries that add metadata, trust signals, reputation, or service declarations around that identity.

That distinction matters.

## Why Deside Separates Passport From Protocol Registries

The product should not flatten every source into one undifferentiated list.

If every source is treated as semantically identical, Deside loses an important part of its model:

- some sources are better starting points for canonical onchain identity
- some sources are better at enrichment around that identity

Today, Deside models that distinction as:

- one passport anchor when available
- multiple protocol registries and enrichment sources around it

## Passport

In Deside, a passport is the strongest available starting point for canonical onchain agent identity.

When a passport exists, Deside should prefer it as the base anchor for the resolved identity.

This does not mean that the passport is the only source that matters.

It means that the passport is the best place to start when deciding:

- what onchain identity should anchor this agent?
- what should count as the canonical base?

Another way to say this is:

- the passport gives Deside its strongest starting point for canonical onchain identity

That matters because the product should prefer stronger onchain anchors over weaker local heuristics whenever they exist.

### MPL Agent Registry (Metaplex)

Official reference: [metaplex-foundation/mpl-agent](https://github.com/metaplex-foundation/mpl-agent)

In the current model, MPL Agent Registry (Metaplex) is treated as the passport anchor.

Its role is:

- canonical passport anchor
- minimal onchain identity base
- strong product starting point for canonical agent identity

Why this matters in practice:

- the passport gives Deside an onchain starting point that is stronger than a purely display-level or self-declared identity claim
- it gives the resolution model a better anchor for deciding what should count as the base identity when several source records exist
- it lets richer protocol registries enrich that identity without replacing its canonical starting point

Its limit is also important:

- it is not, by itself, a full reputation system
- it is not the complete product profile for the agent

So this should not be read as passport-only.

## Protocol Registries

Protocol registries are not meaningless secondary copies.

They are important identity and enrichment inputs.

They can add:

- protocol-native metadata
- protocol-native trust signals
- reputation models
- service declarations
- source-specific onchain references

Deside should preserve those signals without letting them fragment the visible product identity.

In product terms, the ideal outcome is not to force an agent to choose exactly one registry forever.

The better outcome is:

- the same agent can register across multiple protocol registries
- those records can preserve source-specific structure
- Deside can still converge them into one visible identity

One of the strongest visible product signals for that convergence is continuity of the same `ownerWallet` across multiple registry records.

## Quantu 8004-Solana

Official reference: [Quantu 8004-Solana](https://github.com/QuantuLabs/8004-solana)

Role in Deside:

- protocol registry
- identity input
- protocol-native reputation and metadata source

Strength:

- ATOM reputation
- Core-based identity model
- richer registry-native metadata than a minimal passport anchor

Limit:

- not the universal canonical passport by itself

## Cascade SATI

Official reference: [cascade-protocol/sati](https://github.com/cascade-protocol/sati)

Role in Deside:

- protocol registry
- identity input
- structured trust and registration source

Strength:

- SATI-native trust signals and attestations when available
- structured protocol-native registration model

Limit:

- separate identity substrate from the passport model

## SAID Protocol

Official reference: [kaiclawd/said](https://github.com/kaiclawd/said)

Role in Deside:

- protocol registry
- identity input
- protocol-native identity and reputation source

Strength:

- independent source of identity and reputation data
- source-specific metadata and registration signals

Limit:

- separate from the passport model

## SAP

Role in Deside:

- protocol registry
- identity input
- additional source-specific registration surface

The exact onchain object type is not the primary product question.

The relevant point is that SAP can contribute source-specific identity evidence and registry presence that Deside can converge into one product identity.

## Why This Distinction Matters In Practice

Different sources may expose different kinds of onchain objects and references for what product should still understand as the same agent.

For example, depending on the source, Deside may end up observing different onchain structures behind the same agent identity:

- a Core asset
- a source-specific PDA
- a source-specific mint
- source-specific owner or authority references

That variability is not a bug in the model.

It is one of the reasons the model exists.

Deside should preserve that multi-source structure behind the scenes while still projecting one visible product identity.

This is also why the system should not be explained as though one registry object automatically replaces every other one.

The goal is not to force all sources into the same object type.

The goal is to determine whether those different source records belong to the same agent identity in product.

## Preferred Canonical Anchor Does Not Mean Source Monoculture

Using a passport as the preferred canonical anchor means:

- prefer the strongest canonical anchor when it exists
- preserve protocol-native enrichment around that anchor
- keep working when no passport exists yet

In practical product terms, that means:

1. start from the best canonical anchor when it exists
2. preserve the fact that the same agent may also exist in multiple protocol registries
3. let those registries contribute richer source-specific signals around the same agent identity

It does not mean:

- replace every protocol registry with one source
- discard protocol-native reputation
- require every agent to look identical onchain
- pretend the ecosystem has already converged on one registry model

## How Deside Reads Multi-Registry Identity

Deside should be understood as source-aware without being source-captured.

That means:

- extract entries from multiple registries
- resolve them into one canonical identity
- preserve source-specific evidence behind that identity
- project one visible agent in product

When several records appear to belong to the same agent, one of the strongest visible product signals is continuity of the same `ownerWallet` across those sources.

This should not be read as a simplistic claim that `ownerWallet` is the only signal in the entire system.

It should be read as a product-facing convergence rule:

- when the same owner wallet appears across multiple registry records for what should be one agent, Deside should strongly prefer projecting one visible agent identity rather than several fragmented ones

The product should not force the user to think in terms of five separate registries for one agent.

But the system should still preserve that evidence behind the scenes.

## Wallet-Level Reputation Is Separate

Wallet-level reputation is not the same thing as passport or protocol-registry identity.

It is a separate layer.

When exposed by the public surface, wallet-level reputation can apply to:

- user wallets
- agent wallets

without being the same thing as registry identity.

### FairScale

In the current public model, FairScale is treated as a wallet-level reputation input rather than a passport anchor or protocol registry.

That distinction should remain explicit.

## Metadata Delivery Is Also Separate

Identity source and metadata transport are different concerns.

When supported sources expose offchain metadata, Deside can consume public metadata and images served over:

- `https://`
- `ipfs://`
- `ar://`
- public gateway-backed delivery

This is an implementation detail around delivery, not the same thing as choosing the canonical identity source.

## Product Rule

The product rule remains simple even if the source structure is not:

- one visible agent identity in product
- one canonical starting point when a passport exists
- protocol-native enrichment preserved around that identity
- convergence across multiple registry records when they belong to the same agent
- no forced registry monoculture

That is how Deside treats passport and protocol registries.
