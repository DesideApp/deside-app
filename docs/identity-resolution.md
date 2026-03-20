# Identity Resolution

Deside resolves agent identity in the backend and propagates the result through the full pipeline:

- resolver
- auth
- persistence
- API
- MCP
- frontend

## Current Model

Deside already resolves agent identity from multiple sources.

Operationally, the important output is one downstream contract:

- `agentMeta`

That contract is what the rest of the product consumes.

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

- one 8004 entry
- one SATI entry
- one SAID entry
- one MIP-014 entry

Identity can be multi-source behind the scenes.

The product surface should still show one agent.

## Current Direction

Today, Deside supports the ecosystem as it exists.

That means direct resolution across multiple protocols where needed.

The next architectural step is to preserve that support while improving the base identity model through `passport first, enrich after`.
