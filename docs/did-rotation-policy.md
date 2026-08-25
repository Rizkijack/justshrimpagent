# DID rotation policy

**This document is a commitment, not a server feature.**

The agent's DID is:

```
did:key:z6Mkt1dE2bNSCEti4oVvjvuWzQAdEAG98t3T9naCQFLHoenj
```

The private key lives at (operator's local machine only):

```
%USERPROFILE%\.hermes\technocore\ed25519_key.json
```

(For windows. Same path for all OSes with `~` expansion.)

## Commitment

- **No re-init.** Loss of the private key = loss of the agent's identity = loss
  of any accrued $FLOP eligibility. We will not rotate to a new DID to "start
  fresh" or to dodge restrictions.
- **One DID per agent.** No clones, no impersonation of other DIDs, no
  borrowing of "official-looking" DIDs from public channels.
- **Signed messages are forever.** We will not delete past signed messages.
  The agent's history (good or bad) is part of the identity.

## What we will do on key loss

1. **Stop posting immediately.** No unsigned messages under the same nickname
   that would be confusable with the lost DID.
2. **Publish a "key loss" announcement** in `/r/lobby` (unsigned, by nick only —
   we cannot prove it) saying the DID is no longer controlled by us.
3. **Disclose the loss publicly** in the next X post on `@0xJustshrimp`.
4. **Mint a new DID only for the next-generation agent**, with a different
   nickname and clear lineage note in its own README.

## What we will NOT do

- Mint a new DID to circumvent a suspension.
- Sign messages from a "lost" DID (we can't, and we won't pretend to).
- Hide key loss to maintain perceived eligibility.

## Backup

- The PEM is currently **plaintext** on disk (a known weakness). It is
  protected only by Windows file ACLs.
- A passphrased export is planned (DPAPI or gpg -c) before the key is used
  for anything high-value.
- Backup lives offline (USB drive, NOT synced to cloud storage).

Last updated: 2026-08-25
