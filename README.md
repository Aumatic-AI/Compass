# Suruchi Foods WhatsApp System — Next.js (no n8n)

This replaces the n8n workflow with a real codebase, using the exact same
Supabase database you already built (`customers`, `messages`, `knowledge_base`,
`products`). Nothing in Supabase needs to change.

## 1. Install dependencies

Requires Node.js 18+ installed on your computer.

```
npm install
```

## 2. Set up your environment variables

```
cp .env.example .env.local
```

Then open `.env.local` and fill in:
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — from your existing "Sweets" Supabase project (Settings → API)
- `OPENAI_API_KEY` — from platform.openai.com
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` — from console.twilio.com (same account you used for the n8n sandbox testing)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — from your Razorpay dashboard

## 3. Run it locally

```
npm run dev
```

Visit `http://localhost:3000/dashboard` — you should see your existing customers and messages from Supabase, listed live.

## 4. Connect Twilio Sandbox to this local server (for testing, since Meta verification isn't done yet)

Your local server isn't reachable from the internet by default, so Twilio can't send it messages directly. Use a tunnel tool like **ngrok**:

```
npx ngrok http 3000
```

This gives you a public URL like `https://abc123.ngrok-free.app`. Then:

1. Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message → Sandbox settings
2. Set **"When a message comes in"** to: `https://abc123.ngrok-free.app/api/whatsapp/webhook`
3. Method: POST
4. Save

Send a WhatsApp message to the sandbox number (`join <code>` first if needed) — it should hit your local server, run the whole conversation logic, and reply back on WhatsApp, all without n8n.

## 5. When you're ready to deploy for real (not just local testing)

Deploy to **Vercel** (built for Next.js):
```
npx vercel
```
Then set the same environment variables in Vercel's dashboard, and update Twilio's webhook URL to your Vercel URL instead of the ngrok one (ngrok URLs are temporary and change every restart).

## 6. Switching from Twilio Sandbox to Meta Cloud API later

Once Meta Business verification is complete for the real number, only **one file** needs to change: `lib/core/integrations/whatsapp.ts`. Replace its contents with a call to Meta's Graph API instead of Twilio's SDK. The webhook route (`app/api/whatsapp/webhook/route.ts`) will also need its parsing updated, since Meta sends JSON instead of form-encoded data — everything else (`runConversation.ts`, the AI logic, the database calls) stays exactly the same.

## 7. Project structure — what's "core" vs what's "config"

- `lib/core/` — all logic. Identical for every client. Never edit this per-business.
- `lib/clients/<client_id>/config.json` — one file per business: branding, catalog categories, which workflow steps apply, the system prompt.
- To onboard a new business: copy `lib/clients/_template/config.json` to a new folder, fill it in, set `CLIENT_ID` in that deployment's environment variables to match.

## 8. What's NOT built yet (known next steps)

- `orders`, `order_items`, `payments`, `deliveries` tables and logic — the AI agent currently answers questions but doesn't yet create real orders or send payment links. Wire `lib/core/integrations/razorpay.ts` into `runConversation.ts` once these tables exist.
- Broadcast/campaign sending.
- Voice calls (ElevenLabs) — was discussed but not part of this scaffold.
- Prescription verification step — exists as a concept for future pharma clients, not implemented (see `_comment_prescription` in the template config).
