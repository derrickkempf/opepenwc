// api/wallet.js — Vercel serverless function for real wallet verification.
//
// Two actions (POST JSON):
//   { action:"nonce",  address }                 -> { nonce, message }
//   { action:"verify", address, message, signature } -> { ok:true, address } | { ok:false, error }
//
// The nonce is stateless: it carries an HMAC signed with WALLET_NONCE_SECRET, so we can
// verify it later without a database. On "verify" we recover the signer from the signature
// using ethers and confirm it matches the claimed address and a fresh, untampered nonce.

import crypto from "node:crypto";
import { verifyMessage } from "ethers";

const SECRET = process.env.WALLET_NONCE_SECRET || "owc-dev-secret-change-me";
const TTL_MS = 10 * 60 * 1000; // nonce valid for 10 minutes

function mac(payload) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 32);
}
function makeNonce(address) {
  const ts = Date.now();
  const rand = crypto.randomBytes(8).toString("hex");
  const base = `${address.toLowerCase()}.${ts}.${rand}`;
  return `${base}.${mac(base)}`;
}
function checkNonce(address, nonce) {
  const parts = String(nonce).split(".");
  if (parts.length !== 4) return false;
  const [addr, ts, rand, sig] = parts;
  if (addr !== String(address).toLowerCase()) return false;
  if (!ts || Date.now() - Number(ts) > TTL_MS) return false;
  // constant-time compare
  const expected = mac(`${addr}.${ts}.${rand}`);
  const a = Buffer.from(sig), b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function messageFor(address, nonce) {
  return `Opepen World Cup\n\nSign in to verify your wallet. This is free and does not send a transaction.\n\nAddress: ${address}\nNonce: ${nonce}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  try {
    if (body.action === "nonce") {
      const address = String(body.address || "");
      if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
        res.status(400).json({ error: "Invalid address" });
        return;
      }
      const nonce = makeNonce(address);
      res.status(200).json({ nonce, message: messageFor(address, nonce) });
      return;
    }

    if (body.action === "verify") {
      const { address, message, signature } = body;
      if (!address || !message || !signature) {
        res.status(400).json({ ok: false, error: "Missing address, message, or signature" });
        return;
      }
      const m = /Nonce:\s*(\S+)/.exec(message);
      const nonce = m && m[1];
      if (!nonce || !checkNonce(address, nonce)) {
        res.status(400).json({ ok: false, error: "Invalid or expired nonce" });
        return;
      }
      let recovered;
      try { recovered = verifyMessage(message, signature); }
      catch { res.status(400).json({ ok: false, error: "Bad signature" }); return; }

      if (recovered.toLowerCase() !== String(address).toLowerCase()) {
        res.status(401).json({ ok: false, error: "Signature does not match address" });
        return;
      }
      res.status(200).json({ ok: true, address: recovered.toLowerCase() });
      return;
    }

    res.status(400).json({ error: "Unknown action" });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
