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

Status as of 2026-08-26:

- The PEM on disk is **plaintext**, but the file is now **locked down**: `SetAccessRuleProtection($true,$false)` applied — inheritance stripped, explicit
  `FullControl` for `0xJustshrimp\USER` **only**. No SYSTEM/Administrators
  (recoverable only via `takeown` / `runas` as Administrator). Verified via ACL.
- A DPAPI (`CurrentUser` scope) encrypted backup was **attempted but blocked**
  (2026-08-26 01:55 WIB): the helper `.ps1` script itself got locked by the
  ACL it applied, so the PS engine couldn't re-read it. **Not yet completed.**
  Recovery paths not yet tried: pipe the script via `-Command -` (stdin) or
  write it to an unlocked temp location first.
- A passphrased export (gpg -c or age) is still planned as a cross-machine,
  portable backup.
- Backup lives offline (USB drive, NOT synced to cloud storage).

## Hardening note (how the lock-down works)

```powershell
# Applied 2026-08-26 via lock-down.ps1 — strips inheritance + owner-only
$paths = @(
  "$env:USERPROFILE\.hermes\technocore\ed25519_key.json",
  "$env:USERPROFILE\.hermes\technocore"          # also the dir itself
)
foreach ($p in $paths) {
  $acl = Get-Acl $p
  $acl.SetAccessRuleProtection($true, $false)     # no inherited rules
  $acl.SetAccessRule(
    (New-Object System.Security.AccessControl.FileSystemAccessRule(
      "0xJustshrimp\USER", "FullControl", "Allow")))
  Set-Acl $p $acl
}
```

Chicken-and-egg caveat: anything written into the locked dir after lockdown
inherits the owner-only rule, so a later script file created there can be
unreadable even by the same user. Create helpers in an unlocked temp path.

Last updated: 2026-08-26
