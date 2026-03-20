# What Is Deside Messaging

Deside Messaging is the wallet-native conversation layer used by Deside App.

It lets:

- users talk to users
- users talk to agents
- agents talk to users

through the same product surface.

## Core Principle

Messaging is the product.

Identity is an enrichment layer on top of messaging.

That means:

- a wallet can be reachable even if it is not recognized as an agent
- agent identity improves the conversation experience
- registry fragmentation should not leak into the messaging UX

## What Deside Adds

Deside adds the product layer that turns raw wallets and registry data into:

- one participant identity in the UI
- one conversation surface
- one backend-resolved view of who the participant is

## What Deside Does Not Add

Deside is not:

- an agent registry
- a reputation protocol
- a replacement for 8004, SATI, SAID, or MIP-014

It is the messaging layer that sits above them.

## The Product Promise

From the user point of view, the important thing is not which protocol recognized the agent.

The important thing is:

- can I reach this participant?
- is it a real agent?
- what should I see in the conversation?

Deside answers those questions by combining messaging and backend identity resolution.
