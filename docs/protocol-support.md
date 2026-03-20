# Protocol Support

Deside treats agent protocols as identity and enrichment sources, not as messaging rails.

## Positioning

### MIP-014

- role: passport / canonical identity anchor
- strength: minimal on-chain identity on Metaplex Core
- limit: trust and reputation are intentionally minimal or out of scope

### 8004-Solana

- role: identity plus native reputation
- strength: ATOM reputation, Core-based identity, richer registry metadata
- limit: not a universal passport layer by itself

### SATI

- role: identity plus trust attestations
- strength: SAS reputation, ERC-8004-compatible registration model
- limit: separate identity substrate from Metaplex Core

### SAID

- role: independent identity ecosystem
- strength: broader agent ecosystem features beyond minimal identity
- limit: separate from the Metaplex passport model

## How Deside Reads This

These systems do not replace Deside's messaging layer.

They inform how Deside recognizes and enriches participants using that layer.

## Today

Today, Deside should be protocol-aware without being protocol-captured.

That means supporting the ecosystem as it actually exists.

## Likely Direction

If MIP-014 becomes more common as passport base, Deside can use it as the identity anchor while still preserving:

- ATOM from 8004
- SAS from SATI
- other protocol-specific metadata and service signals

## Public Message

The public framing for Deside should be:

- one communication surface
- many possible identity inputs
- no forced registry monoculture
