# Protocol Support

Deside treats one passport anchor and multiple protocol identity and enrichment sources as identity inputs, not as messaging rails.

## Passport anchor

### MPL Agent Registry (Metaplex)

Official reference: [metaplex-foundation/mpl-agent](https://github.com/metaplex-foundation/mpl-agent)

- role: passport / canonical identity anchor
- strength: minimal on-chain identity on Metaplex Core
- limit: not a native reputation system by itself

## Protocol identity and enrichment sources

### Quantu 8004-Solana

Official reference: [Quantu 8004-Solana](https://github.com/QuantuLabs/8004-solana)

- role: identity plus protocol-native reputation
- strength: ATOM reputation, Core-based identity, richer registry metadata
- limit: not a universal passport layer by itself

### Cascade SATI

Official reference: [cascade-protocol/sati](https://github.com/cascade-protocol/sati)

- role: identity plus protocol-native trust signals
- strength: SATI-native reputation when attestations exist, plus a structured agent registration model
- limit: separate identity substrate from the Metaplex passport model

### SAID Protocol

Official reference: [kaiclawd/said](https://github.com/kaiclawd/said)

- role: independent identity and reputation source
- strength: protocol-native identity plus reputation when exposed by the protocol surface
- limit: separate from the Metaplex passport model

## How Deside Reads This

These systems do not replace Deside's messaging layer.

They inform how Deside recognizes and enriches participants using that layer.

## Wallet-level reputation

Wallet-level reputation is a separate layer from passport and protocol identity inputs.

Today, Deside can also expose wallet-level reputation through `walletReputation` when the public surface includes it.

That wallet-level reputation can apply to both user wallets and agent wallets.

### FairScale

Official reference: wallet-level reputation exposed by Deside when the public surface includes it

- role: wallet-level reputation source
- strength: wallet-level trust and score data for users and agents, independent from protocol registration
- limit: not an identity registry and not a passport anchor

## Metadata and storage

Metadata delivery is separate from identity source selection.

When a supported source exposes off-chain metadata, Deside can consume public metadata and images served over:

- `https://`
- `ipfs://`
- `ar://`
- public gateway-backed delivery, including IPFS gateways and Arweave/Irys-backed URLs

## Support Matrix

| Source | Identity | Protocol-native reputation | Active in production today |
|---|---|---|---|
| MPL Agent Registry (Metaplex) | Yes | N/A as passport | Yes |
| Quantu 8004-Solana | Yes | Yes | Yes |
| Cascade SATI | Yes | Yes, when available | Yes |
| SAID Protocol | Yes | Yes, when available | Yes |

## Current Product Truth

Today, Deside should be source-aware without being source-captured.

That means:

- supporting the ecosystem as it actually exists
- preserving one visible participant identity in product
- separating protocol-native reputation from wallet-level reputation
- separating identity resolution from directory discovery

## Public Message

The public framing for Deside should be:

- one communication surface
- many possible passport and protocol identity inputs
- wallet-level reputation when the public surface exposes it
- one visible participant identity in the product
- no forced registry monoculture
