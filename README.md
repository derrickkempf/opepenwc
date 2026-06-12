# Opepen World Cup

A single-file voting app: two Opepen go head-to-head, the crowd picks the winner, and a
shared scoreboard settles it. Check in with an email or a wallet, vote LFT/RGT, watch results.

Everything is one static file — `index.html` — plus a tiny Supabase database for the shared
data. No build step, no framework.

---

## How it works

- **The matchup and every vote** live in Supabase (a free Postgres database) so they're the
  same for everyone and update live.
- **Your identity** (who's checked in on this browser) stays in your browser only.
- If you don't configure Supabase, the app still runs in **local-only demo mode** — voting works
  but only on your own device.

The app talks to a single `kv` (key/value) table through a small `window.storage` layer, so
there's nothing else to manage.

---

## Go live in 4 steps

### 1. Create the database (Supabase — free)

1. Sign up at [supabase.com](https://supabase.com) and create a new project (any name; pick a
   region near your users). Wait for it to finish provisioning.
2. Open **SQL Editor → New query**, paste in [`supabase.sql`](./supabase.sql), and click **Run**.
   That creates the `kv` table, opens it to the public key, and enables realtime.

### 1b. Turn on email magic links

1. In Supabase go to **Authentication → Sign In / Providers** and make sure **Email** is enabled
   (it is by default). Magic links work out of the box with Supabase's built-in email.
2. Go to **Authentication → URL Configuration** and set:
   - **Site URL** → your live URL (e.g. `https://your-app.vercel.app`)
   - **Redirect URLs** → add the same URL (and `http://localhost:3000` if you test locally)
   This lets the link in the email return people to your site, signed in.

> Supabase's built-in email is **rate-limited** (a handful per hour) and meant for testing. For a
> real event, add your own SMTP under **Authentication → Emails → SMTP Settings** (any provider:
> Resend, Postmark, SendGrid, etc.) so links always send.

### 2. Get your two public values

In Supabase go to **Project Settings → API** and copy:

| Copy this | Paste into `index.html` |
|---|---|
| **Project URL** | `SUPABASE_URL` |
| **anon / publishable key** | `SUPABASE_ANON_KEY` |

The anon key is **meant to be public** — it ships to every browser. That's expected and safe.

### 3. Paste them into the app

Near the top of the `<script>` in `index.html` you'll see:

```js
const SUPABASE_URL      = "";
const SUPABASE_ANON_KEY = "";
```

Put your two values inside the quotes. Save. (Leaving them blank keeps demo mode.)

### 4. Deploy

Put these at the **root** of a GitHub repo:

```
index.html        # the app (must be named index.html)
api/wallet.js     # serverless function: real wallet signature verification
package.json      # declares the "ethers" dependency for the function
supabase.sql      # (reference) the DB setup you already ran
README.md
```

- Import the repo into [Vercel](https://vercel.com). Framework preset: **Other**, leave the build
  command empty. Vercel serves `index.html` statically and automatically runs `api/wallet.js` as a
  serverless function, installing `ethers` from `package.json` for it.
- (Recommended) In Vercel **Settings → Environment Variables**, add `WALLET_NONCE_SECRET` = any
  long random string. It signs the wallet sign-in nonces. Without it a built-in dev default is used.
- Open the live URL. In the browser console you should see `data mode: shared (Supabase)`.

Push a commit and Vercel redeploys automatically.

### Environment variables summary

| Where | Name | Purpose |
|---|---|---|
| In `index.html` | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | shared data + email magic links (public, safe in browser) |
| Vercel env vars | `WALLET_NONCE_SECRET` | server-side secret that signs wallet nonces (recommended) |

---

## Running the event

- Go to **/admin** (the **Admin** link in the footer). Passcode is set by `ADMIN_PASSCODE` near
  the top of `index.html` (default `dewdOpepen082` — change it before sharing).
- Upload the two Opepen images, set the edition / title / voting window, and **Save & start new
  match**. Everyone sees the new matchup live.
- The two built-in Opepens are already loaded as the default matchup, so the site works the
  moment it's deployed.

## Voting & identity

- Check in by **email magic link** or by **connecting a wallet** (sign a message — no
  transaction, no gas). One vote per identity per match; voters can switch sides until full time.
- **Email magic links are real** when Supabase is configured: entering an email sends a verified
  one-time link; clicking it returns the person to the site already signed in.
- **Wallet check-in is verified server-side.** The browser asks `api/wallet` for a one-time nonce,
  the user signs it in their wallet, and the function recovers the signer with `ethers` and
  confirms it matches the claimed address before the person is checked in — so an address can't be
  spoofed. (If the function isn't deployed — e.g. opening the file locally — it falls back to a
  client-only signature so the demo still works.)

## Notes & tradeoffs

- **Open write policy.** The SQL opens the table to anyone with the site, which is the simplest
  setup for an open, fun vote. If you later want to require sign-in, replace the `public write`
  policy in `supabase.sql` with an `authenticated`-scoped policy and add Supabase Auth.
- **Image size.** Admin-uploaded images are stored inline in the shared match row. Keep them
  reasonably sized (the built-in vector Opepens are tiny).
- **Admin passcode** lives in the client source, so it gates casual access but isn't a true
  secret on a public site. Fine for a prototype; real protection would live server-side.
