# base-batches-02 submission

> _"While our competitors are deploying yesterday's strategies, we're already
> frontrunning tomorrow's mistakes."_
>
> — Copyright © Franklin J. Merrimont, Founder & Chairman, The Firm

---

## Overview - HorsePower Awarding Webhook & Reindexing script 

This is a selective snapshot of The Firm's broader Turborepo monorepo, showing how our community-behaviour-shaping tool *"HorsePower"* is awarded to users via Neynar webhooks and if necessary, a reindexing script.

## Flow

1. The Firm team member comments on Farcaster cast rewarding or deducting horsepower "𓃗 +111 horsepower (HP) awarded for those inspiring words"
2. Neynar Webhook sends POST request when permitted accounts comment to The Firm's Encore API,
3. Encore endpoint identifies and extracts any HP value being awarded or deducted
4. Database stores horsepower event, awarding HP to original cast author
5. Batch script can reindex historical awards

## Architecture

### Core Files

- `apps/encore-api/src/neynar/webhooks/horsepower-comment.ts` - Real-time webhook that awards horsepower when users comment with HP award text
- `packages/db/src/scripts/reindex-horsepower-events.ts` - Batch script to reindex historical horsepower awards

### Tech Stack

- **Framework**: Encore.dev (TypeScript cloud platform)
- **Database**: PostgreSQL with Drizzle ORM
- **APIs**: Neynar SDK for Farcaster integration
- **Runtime**: Node.js with ESM modules

## Repository Structure

```
├── apps/                          
│   └── encore-api/                
│       └── src/
│           └── neynar/
│               └── webhooks/
│                   └── horsepower-comment.ts      # Neynar webhook receiver endpoint
└── packages/                                      # Shared library packages
    ├── db/                                        # Database package (cleaned-up structure)
    │   └── src/
    │       ├── schema/                            # Database schema definitions
    │       │   ├── horsepower/                    # Horsepower event schemas
    │       │   │   ├── horsepower-events.ts
    │       │   │   ├── horsepower-event-sources.ts
    │       │   │   └── horsepower-recipient-account-types.ts
    │       └── queries/                           # Horsepower queries
    │           ├── crud/
    │           │   ├── inserts/                  
    │           │   │   ├── insert-horsepower-event.ts
    │           │   └── upserts/  
    │           │       └── upsert-farcaster-accounts.ts
    │           └── reindex-horsepower-events.ts
    └── utils/                   
        └── src/
            ├── shared/            
            │   └── horsepower/                     # Horsepower extraction regex/utilities
            │       ├── extract-horsepower-value.ts
            │       ├── horsepower-comment-regex.ts
            │       └── horsepower-test-data.ts
            └── server/            
                └── neynar/                         # Neynar API utilities
                    ├── fetch_bulk_users.ts
                    ├── fetch_casts_for_user.ts
                    └── neynar_client.ts
```