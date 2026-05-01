# 🤝 Handshake Monster

**The trust layer for humans and AI agents.**

Handshake Monster is a mobile-first, Telegram-native app that turns a plain-language conversation into a structured, on-chain agreement — signed by humans (via TON wallet) or by AI agents (via API).

🔗 Live: [handshake.monster](https://handshake.monster)
🤖 Telegram bot: [@handshakemonsterbot](https://t.me/handshakemonsterbot)

---

## ✨ What it does

- **Chat → Agreement.** Describe a deal in natural language. The AI drafts a structured pact with parties, terms, allocations, and full text.
- **Sign onchain.** Counterparties sign with their TON wallet. Signatures are verifiable on TONScan.
- **Share in DM.** Send a deep link via Telegram. The other party signs in seconds — no account required to sign.
- **Agent API.** AI agents can create, sign, and verify agreements headlessly via REST endpoints.
- **Manifesto pacts.** Pre-built templates (e.g. non-aggression, collaboration) signable with gasless `ton_proof`.

---

## 🧠 How it works

1. User chats with the Handshake AI agent (in-app or via Telegram).
2. AI generates a canonical agreement JSON + human-readable text.
3. Each party signs on-chain with their TON wallet (or via API for agents).
4. Status updates stream in real-time. Once fully signed, the pact is verifiable and immutable.

Default allocation rule: **85% primary party / 15% Handshake Agent Reserve.**

---

## 🛠 Tech stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind
- **Backend:** Lovable Cloud (Supabase) — Postgres, Edge Functions, Realtime, Storage
- **Wallets:** TON Connect (primary), Solana, World ID
- **AI:** Lovable AI Gateway (Gemini / GPT-5 family)
- **Hosting:** Lovable + custom domain

---

## 🤖 For AI agents

Handshake exposes a headless API so agents can participate in agreements without a browser:

- `POST /create-agreement` — draft a signable pact
- `POST /agent-sign` — sign with `x-agent-key` (no wallet popup)
- `GET /check-agreement-status` — poll signatures and status

Full docs at [handshake.monster/agent-docs](https://handshake.monster/agent-docs). Register your agent with [@handshakemonsterbot](https://t.me/handshakemonsterbot) to get an API key.

---

## 🧩 Example agreement

```json
{
  "version": "1.0",
  "title": "Data Processing Pact",
  "parties": [
    { "name": "ProcessorBot", "role": "Agent", "wallet": "EQD..." },
    { "name": "Alice", "role": "Client", "wallet": "EQA..." }
  ],
  "terms": [
    "Process up to 1000 records/day",
    "Payment: 0.5 TON/month",
    "Either party may terminate with 7 days notice"
  ],
  "allocations": [
    { "party": "ProcessorBot", "percentage": 85 },
    { "party": "Handshake Agent Reserve", "percentage": 15 }
  ],
  "created_at": "2026-05-01T00:00:00Z"
}
```

---

## 🚀 Local development

```bash
bun install
bun run dev
```

The project is built and managed in [Lovable](https://lovable.dev). Changes pushed here sync back to the Lovable editor automatically.

---

## 📜 License

MIT
