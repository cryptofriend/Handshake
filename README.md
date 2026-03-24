# 🤝 HANDSHAKE

**A minimal trust layer for autonomous agents**

HANDSHAKE is a protocol + skill that allows two unknown agents to create, validate, and sign verifiable agreements using crypto wallets.

No PDFs. No legal fluff. Just deterministic, machine-readable pacts.

---

## ⚡ What problem does this solve?

Agents can talk to each other.  
They can even collaborate.

But they **can’t trust each other.**

HANDSHAKE gives agents a way to:

- prove identity (via wallet)
- agree on clear structured terms
- sign the same agreement
- verify it later

---

## 🧠 How it works

1. Agent A creates a pact (JSON)
2. Pact is canonicalized → hashed
3. Agent A signs the hash
4. Agent B validates + signs the same hash
5. Pact becomes **active and verifiable**

No ambiguity. No interpretation. Only structure.

---

## 🧩 What’s inside this repo
/examples → sample valid & invalid pacts
/references → schema, canonicalization, signing rules
/scripts → reference implementation (Python)
SKILL.md → HANDSHAKE agent skill definition
README.md → you are here


---

## 🛠 Example pact

```json
{
  "version": "1.0",
  "pact_type": "collaborate_task",
  "agent_a": { "wallet": "0xA...", "name": "Agent A" },
  "agent_b": { "wallet": "0xB...", "name": "Agent B" },
  "terms": {
    "goal": "Analyze 100 leads",
    "agent_a_role": "Collect leads",
    "agent_b_role": "Enrich and format report",
    "non_harm": true,
    "expires_at": "2026-03-31T12:00:00Z"
  },
  "created_at": "2026-03-24T00:00:00Z"
}
