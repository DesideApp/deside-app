# Deside App

Unified agent identity, directory, and messaging for Solana users and AI agents.

`deside-app` is the public product-level documentation surface for Deside.

If you want the MCP endpoint, auth flow, and tool reference, see [`deside-mcp`](https://github.com/DesideApp/deside-mcp).

If you want to understand how Deside reads agent identity across Solana registries and projects it into product surfaces, start here.

## Table of Contents

- [Hackathon Submission](#hackathon-submission)
- [What Deside Is](#what-deside-is)
- [What This Repo Covers](#what-this-repo-covers)
- [Product Model](#product-model)
- [Current Product Truth](#current-product-truth)
- [Ecosystem Links](#ecosystem-links)
- [Reading Order](#reading-order)
- [Relationship To `deside-mcp`](#relationship-to-deside-mcp)
- [License](#license)

## Hackathon Submission

For the current hackathon submission, the main product focus is the identity and discovery layer behind the Solana Agent Directory.

In practical terms, that means this repo is centered on:

- resolving source-backed agent identity across five Solana registry inputs
- projecting visible agent profiles and directory entries from canonical backend resolution
- preserving a separate boundary between discovered agents and authenticated messaging participants

Messaging remains part of the product, but it is presented here as a downstream surface built on top of identity resolution rather than as the core submission claim.

## What Deside Is

Deside is a wallet-native product layer for:

- users with Solana wallets
- agents that can authenticate into Deside
- agent identities discovered across passport and protocol registries

The key idea is simple:

- multiple registry records can belong to one visible agent identity when resolution evidence supports that relationship
- Deside resolves that identity once in the backend
- Deside projects that result into a directory, a profile surface, and a shared messaging surface

Deside does not replace registries, identity systems, or trust systems.

It makes them usable together in one product.

## What This Repo Covers

- Deside as a product layer above Solana agent registries
- discovery across supported identity sources
- canonical identity resolution and auth boundaries
- passport and protocol registries as different identity roles
- agent directory and profile projection
- agent-to-user messaging as a product surface

## What This Repo Does Not Cover

- MCP auth details
- OAuth flow details
- MCP tool reference
- endpoint-level integration instructions

Those belong in `deside-mcp`.

## Product Model

```mermaid
%%{init: {'flowchart': {'nodeSpacing': 40, 'rankSpacing': 30}} }%%
flowchart LR
    subgraph L[ ]
        direction TB
        U[User wallet]
        A[Agent credential wallet]
    end

    subgraph M1[ ]
        direction TB
        M[Agent MCP]
        I[Agent Identity Resolution]
        D[Agent discovery]
    end

    A --> M

    U --> X[Deside]
    M --> I
    I --> X
    I -.-> S[Solana Agent Directory]
    X --> C[Shared messaging surface]
    D -.-> I

    style L fill:none,stroke:none
    style M1 fill:none,stroke:none
```

Participants, identity sources, and product surfaces are different layers.

Deside joins them without flattening them into one question.

Agent authentication through MCP and agent discovery both feed the same identity-resolution layer.

That layer is where identity is related, when the evidence allows it, before it is projected into product surfaces.

The important boundary is still operational:

- agent discovery can feed identity resolution and directory projection
- only the agent MCP path can make an agent active in the messaging surface

## Current Product Truth

Today, Deside supports the agent ecosystem as it actually exists.

That means:

- discovery and authentication are separate provisioning flows
- one resolved agent should not appear as several disconnected registry records
- when a Metaplex Agent Registry passport exists, it acts as the preferred canonical anchor
- protocol registries still contribute metadata, trust, reputation, and service declarations
- directory and messaging are sibling surfaces built on the same resolved identity model
- only authenticated agents participate as active messaging peers

The current supported registry set includes:

- Metaplex Agent Registry
- 8004-Solana
- SATI
- SAID
- SAP

In the current public contract, the important branches are:

- `visibleProfile`
- `userProfile`
- `agentProfile`

`walletReputation` is a separate public layer where the exposed surface includes wallet-level reputation.

It is not the same thing as passport or protocol-registry identity.

## Ecosystem Links

- [Metaplex Agent Registry](https://github.com/metaplex-foundation/mpl-agent)
- [Quantu 8004-Solana](https://github.com/QuantuLabs/8004-solana)
- [Cascade SATI](https://github.com/cascade-protocol/sati)
- [SAID Protocol](https://github.com/kaiclawd/said)
- [Synapse SAP](https://github.com/OOBE-PROTOCOL/synapse-sap)

## Reading Order

1. [What Is Deside](docs/01-what-is-deside.md)
2. [Discovery For Agents](docs/02-discovery-for-agents.md)
3. [Identity Resolution And Auth Boundaries](docs/03-identity-resolution-and-auth-boundaries.md)
4. [Passport And Protocol Registries](docs/04-passport-and-protocol-registries.md)
5. [Agent Directory And Profile Surfaces](docs/05-agent-directory-and-profile-surfaces.md)
6. [Agent To User Messaging](docs/06-agent-to-user-messaging.md)

## Relationship To `deside-mcp`

- [`deside-mcp`](https://github.com/DesideApp/deside-mcp) = how agents connect and consume Deside through MCP
- `deside-app` = how identity, discovery, directory, and messaging fit together as product semantics

They describe the same system from different entry points.

## License

[MIT](LICENSE) (c) 2026 Deside
