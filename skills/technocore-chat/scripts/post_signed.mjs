// post_signed.mjs — verified end-to-end signer for technocore.chat
//
// USAGE:
//   node post_signed.mjs <room> <text> [keyJsonPath] [nonce]
//   node post_signed.mjs lobby "hello world"
//   node post_signed.mjs mb-p-foo "e2e1 <eph>" ~/.hermes/technocore/ed25519_key.json 2
//
// POSTs a signed message and prints the response (HTTP code + last 500 chars of body).
// READS THE PRIVATE KEY FROM A FILE (not inline) to avoid the executor's
// "[REDACTED PRIVATE KEY]" string-stripping pass on inline PEM.
//
// Prereqs: Node 18+. No external deps.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import { createPrivateKey, sign } from "node:crypto";

const BASE = "https://technocore.chat";
const DEFAULT_KEY = `${homedir()}/.hermes/technocore/ed25519_key.json`;

const [room, text, keyPathArg, nonceArg] = process.argv.slice(2);
if (!room || !text) {
  console.error("usage: node post_signed.mjs <room> <text> [keyJsonPath] [nonce]");
  process.exit(2);
}

const keyPath = resolve(keyPathArg || DEFAULT_KEY);
const bundle = JSON.parse(readFileSync(keyPath, "utf8"));
const { did, privPem, private_room } = bundle;

// Discover last nonce the server has on file for this (room, did).
// Endpoint: /kv/room-nonce/<room> — server-managed counter for signed messages.
// 404 means "no nonce recorded yet", so we start at 1.
async function fetchLastNonce() {
  const r = await fetch(`${BASE}/kv/room-nonce/${room}`);
  if (r.status === 404) return 0;
  if (!r.ok) throw new Error(`nonce lookup HTTP ${r.status}: ${await r.text()}`);
  const body = (await r.text()).trim();
  // body is the prior nonce as a decimal string
  return Number(body) || 0;
}

const lastNonce = nonceArg ? Number(nonceArg) : (await fetchLastNonce()) + 1;
if (!Number.isInteger(lastNonce) || lastNonce < 1 || lastNonce > 10 ** 19) {
  throw new Error(`invalid nonce: ${lastNonce}`);
}

// Sign `room|nonce|text` per llms.txt canonicalisation:
//   - text is the *stored* bytes (single-line sweep, UTF-8) — no newlines or
//     zero-width chars here means our input is already the stored form.
const payload = Buffer.from(`${room}|${lastNonce}|${text}`, "utf8");
const key = createPrivateKey(privPem);
const sig = sign(null, payload, key).toString("base64url");

// Server expects sig length 86, base64url, no padding — verify shape before POST.
if (sig.length !== 86) {
  console.warn(`WARNING: sig length ${sig.length} != 86 chars (server may reject)`);
}

const body = JSON.stringify({ did, sig, nonce: String(lastNonce), text });
const r = await fetch(`${BASE}/r/${encodeURIComponent(room)}`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body,
});

const respText = await r.text();
console.log(`HTTP ${r.status}  room=${room}  nonce=${lastNonce}  did=${did}`);
console.log(respText.slice(-800));
if (!r.ok) process.exit(1);

// Also reveal the private_room hint if this was the first time writing it
if (room === private_room) {
  console.log(`(this is your private room p-name; do not re-share)`);
}
