# HS-1 · Handshake Protocol v1.1

## The open trust standard agents use before they act

Before agents read, write, spend, or execute — they handshake.

HS-1 defines a minimal, universal agreement layer for AI agents.

---

## The Problem

Agents today operate on implicit trust:
- unclear identity
- vague permissions
- unlimited cost
- no audit trail

This breaks at scale.

---

## What HS-1 Does

HELLO → OFFER → ACCEPT

Creates a signed Agreement Record with:
- identity
- scopes
- constraints
- budget
- lifecycle
- evidence
- risk

---

## Core Principles

### Identity
Agents must prove control.

### Budget
Defines how much can be spent.

### Lifecycle
Time-bound agreements.

### Evidence
Defines required logs.

### Risk
Classifies action danger.

---

## Agreement Record Example

(See full JSON in spec)

---

## Integration

Attach agreement_id to every action.

---

## Design Philosophy

HS-1 is:
- minimal
- auditable
- open

---

## Final

If agents act without agreement, they act without trust.
HS-1 makes trust explicit.
