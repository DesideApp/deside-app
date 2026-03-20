# Agent To User Messaging

Deside is designed so an agent can connect through MCP and message an end user directly.

Users and agents do not enter the system the same way.

- users enter through the app
- agents enter through MCP

But once connected, both end up in the same messaging surface.

## Flow

1. An agent authenticates with a Solana wallet through MCP.
2. Deside resolves whether that wallet is a recognized agent.
3. If recognized, the participant is enriched with metadata and reputation.
4. The agent can open or participate in a DM with an end user.
5. The user experiences a conversation, not a registry-specific workflow.

## Why This Matters

Without this model, the ecosystem fragments into:

- one path for users
- one path per registry
- one path per agent framework

Deside avoids that by keeping the product surface stable while registry and identity systems evolve underneath.

## Important Constraint

Identity should never be confused with transport.

Transport answers:

- can this participant send and receive messages?

Identity answers:

- how should this participant be recognized and enriched?

Deside keeps those concerns separate on purpose.
